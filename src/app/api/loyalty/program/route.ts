import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function GET() {
    try {
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

        const { data: program } = await admin
            .from('loyalty_programs')
            .select('id, reward_threshold, reward_description, points_per_visit')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (!program) return NextResponse.json({
            program: { id: null, reward_threshold: 10, reward_description: '', isNew: true },
            stats: null
        })

        const { count: totalCards } = await admin
            .from('loyalty_cards')
            .select('*', { count: 'exact', head: true })
            .eq('loyalty_program_id', program.id)

        const { data: allCards } = await admin
            .from('loyalty_cards')
            .select('points_balance')
            .eq('loyalty_program_id', program.id)

        const totalPoints = allCards?.reduce((acc, c) => acc + c.points_balance, 0) || 0
        const rewardsReached = allCards?.filter(c => c.points_balance >= program.reward_threshold).length || 0

        return NextResponse.json({
            program,
            stats: { totalCards: totalCards || 0, totalPoints, rewardsReached }
        })
    } catch (error) {
        console.error('GET program error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}

export async function PUT(request: Request) {
    try {
        const { reward_threshold, reward_description } = await request.json()

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

        const { data: existing } = await admin
            .from('loyalty_programs')
            .select('id')
            .eq('restaurant_id', restaurant.id)
            .order('created_at', { ascending: false })
            .limit(1)
            .single()

        if (existing) {
            const { error: updateError } = await admin
                .from('loyalty_programs')
                .update({ reward_threshold, reward_description })
                .eq('id', existing.id)
            if (updateError) throw updateError
        } else {
            const { error: insertError } = await admin
                .from('loyalty_programs')
                .insert([{
                    restaurant_id: restaurant.id,
                    name: 'Programme de fidélité',
                    points_per_visit: 1,
                    reward_threshold,
                    reward_description,
                    is_active: true
                }])
            if (insertError) throw insertError
        }

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('PUT program error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
