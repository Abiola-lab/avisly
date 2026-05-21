import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { email } = await request.json()

        if (!email || !email.includes('@')) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const admin = createAdminClient()

        const { data: cards } = await admin
            .from('loyalty_cards')
            .select(`
                card_code,
                points_balance,
                customer_first_name,
                customer_last_name,
                loyalty_program_id,
                loyalty_programs (
                    reward_threshold,
                    restaurants ( name, primary_color )
                )
            `)
            .ilike('customer_email', email.trim())
            .order('created_at', { ascending: false })

        if (!cards || cards.length === 0) {
            return NextResponse.json({ cards: [] })
        }

        const results = cards.map((c: any) => ({
            cardCode: c.card_code,
            pointsBalance: c.points_balance,
            firstName: c.customer_first_name,
            lastName: c.customer_last_name,
            rewardThreshold: c.loyalty_programs?.reward_threshold || 10,
            restaurantName: c.loyalty_programs?.restaurants?.name || 'Restaurant',
            primaryColor: c.loyalty_programs?.restaurants?.primary_color || '#1d1dd7',
        }))

        return NextResponse.json({ cards: results })
    } catch (error) {
        console.error('Recover error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
