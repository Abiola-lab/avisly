import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: Promise<{ cardCode: string }> }
) {
    try {
        const { cardCode } = await params
        const supabase = createAdminClient()

        const { data: card, error } = await supabase
            .from('loyalty_cards')
            .select(`
                *,
                loyalty_programs(
                    name,
                    reward_threshold,
                    reward_description,
                    points_per_visit,
                    restaurants(name, logo_url, primary_color, google_link)
                )
            `)
            .eq('card_code', cardCode.toUpperCase())
            .single()

        if (error || !card) {
            return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 })
        }

        const program = card.loyalty_programs
        const restaurant = program.restaurants
        const progress = Math.min(
            Math.round((card.points_balance / program.reward_threshold) * 100),
            100
        )

        return NextResponse.json({
            cardCode: card.card_code,
            pointsBalance: card.points_balance,
            rewardThreshold: program.reward_threshold,
            rewardDescription: program.reward_description,
            progress,
            rewardReached: card.points_balance >= program.reward_threshold,
            restaurant: {
                name: restaurant.name,
                logoUrl: restaurant.logo_url,
                primaryColor: restaurant.primary_color || '#1d1dd7',
                googleLink: restaurant.google_link
            },
            createdAt: card.created_at,
            hasContact: !!(card.customer_email && card.customer_first_name && card.customer_last_name),
            customerEmail: card.customer_email || null,
            customerFirstName: card.customer_first_name || null,
            customerLastName: card.customer_last_name || null
        })

    } catch (error) {
        console.error('Loyalty get error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
