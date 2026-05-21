import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
    try {
        const { searchParams } = new URL(request.url)
        const q = searchParams.get('q')?.trim()

        if (!q || q.length < 2) {
            return NextResponse.json({ error: 'Recherche trop courte' }, { status: 400 })
        }

        const authClient = await createClient()
        const { data: { user }, error: authError } = await authClient.auth.getUser()
        if (authError || !user) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })

        const admin = createAdminClient()

        const { data: restaurant } = await admin
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!restaurant) return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })

        // Find ALL programs for this restaurant (any active status)
        const { data: programs } = await admin
            .from('loyalty_programs')
            .select('id, reward_threshold, reward_description')
            .eq('restaurant_id', restaurant.id)

        if (!programs || programs.length === 0) {
            return NextResponse.json({ results: [], noProgram: true })
        }

        const programIds = programs.map(p => p.id)
        const programMap = Object.fromEntries(programs.map(p => [p.id, p]))

        const { data: cards } = await admin
            .from('loyalty_cards')
            .select('card_code, customer_first_name, customer_last_name, customer_email, points_balance, loyalty_program_id')
            .in('loyalty_program_id', programIds)
            .or(`customer_first_name.ilike.%${q}%,customer_last_name.ilike.%${q}%`)
            .limit(10)

        const results = (cards || []).map(c => {
            const prog = programMap[c.loyalty_program_id]
            const threshold = prog?.reward_threshold || 10
            return {
                cardCode: c.card_code,
                firstName: c.customer_first_name,
                lastName: c.customer_last_name,
                email: c.customer_email,
                pointsBalance: c.points_balance,
                rewardThreshold: threshold,
                rewardDescription: prog?.reward_description || '',
                progress: Math.min(Math.round((c.points_balance / threshold) * 100), 100),
                rewardReached: c.points_balance >= threshold
            }
        })

        return NextResponse.json({ results })
    } catch (error) {
        console.error('Search error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
