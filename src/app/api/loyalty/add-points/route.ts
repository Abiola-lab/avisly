import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { cardCode, points, note } = await request.json()
        const authClient = await createClient()
        const supabase = createAdminClient()

        // 1. Auth — must be a logged-in restaurateur
        const { data: { user }, error: authError } = await authClient.auth.getUser()
        if (authError || !user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        // 2. Get restaurateur's restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single()

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant introuvable' }, { status: 404 })
        }

        // 3. Get card and verify ownership
        const { data: card, error: cardError } = await supabase
            .from('loyalty_cards')
            .select('*, loyalty_programs(restaurant_id, reward_threshold, reward_description)')
            .eq('card_code', cardCode.toUpperCase())
            .single()

        if (cardError || !card) {
            return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 })
        }

        if (card.loyalty_programs.restaurant_id !== restaurant.id) {
            return NextResponse.json({ error: 'Cette carte n\'appartient pas à votre établissement' }, { status: 403 })
        }

        // 4. Add points and update balance
        const pointsToAdd = points || 1
        const newBalance = card.points_balance + pointsToAdd

        const { error: updateError } = await supabase
            .from('loyalty_cards')
            .update({ points_balance: newBalance })
            .eq('id', card.id)

        if (updateError) throw updateError

        // 5. Log transaction
        await supabase
            .from('loyalty_transactions')
            .insert([{
                loyalty_card_id: card.id,
                points_added: pointsToAdd,
                note: note || 'Attribution manuelle',
                created_by: user.id
            }])

        const rewardThreshold = card.loyalty_programs.reward_threshold
        const rewardReached = newBalance >= rewardThreshold
        const progress = Math.min(Math.round((newBalance / rewardThreshold) * 100), 100)

        return NextResponse.json({
            success: true,
            newBalance,
            progress,
            rewardReached,
            rewardDescription: rewardReached ? card.loyalty_programs.reward_description : null
        })

    } catch (error) {
        console.error('Add points error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
