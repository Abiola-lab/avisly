import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { campaignId, sessionId } = await request.json()
        const supabase = await createClient()

        // 1. Verify session belongs to campaign and hasn't played yet
        const { data: session, error: sessError } = await supabase
            .from('sessions')
            .select('*')
            .eq('id', sessionId)
            .eq('campaign_id', campaignId)
            .single()

        if (sessError || !session) return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
        if (session.reward_id) return NextResponse.json({ error: 'Vous avez déjà joué' }, { status: 400 })

        // 2. Fetch campaign probability and active rewards
        const { data: campaign, error: campError } = await supabase
            .from('campaigns')
            .select('win_probability')
            .eq('id', campaignId)
            .single()

        if (campError || !campaign) return NextResponse.json({ error: 'Campagne introuvable' }, { status: 400 })

        const { data: rewards, error: rewError } = await supabase
            .from('rewards')
            .select('*')
            .eq('campaign_id', campaignId)

        if (rewError || !rewards || rewards.length === 0) {
            return NextResponse.json({ error: 'Aucun lot disponible' }, { status: 400 })
        }

        // 3. Decide if user wins or loses based on global probability
        const isWinningSpin = (Math.random() * 100) < (campaign.win_probability || 50)

        let pool = rewards.filter(r => r.is_prize === isWinningSpin)

        // Fallback if one pool is empty
        if (pool.length === 0) {
            pool = rewards
        }

        // Pick randomly from the selected pool
        const randomIndexInPool = Math.floor(Math.random() * pool.length)
        const pickedReward = pool[randomIndexInPool]

        // Find the absolute index in the original rewards array (for the wheel animation)
        const absoluteIndex = rewards.findIndex(r => r.id === pickedReward.id)

        // 4. Update session with reward_id
        const { error: updateError } = await supabase
            .from('sessions')
            .update({ reward_id: pickedReward.id })
            .eq('id', sessionId)

        if (updateError) throw updateError

        // 5. Track event
        await supabase.from('analytics_events').insert([{
            session_id: sessionId,
            event_type: 'spin_completed'
        }])

        return NextResponse.json({
            winnerIndex: absoluteIndex,
            rewardLabel: pickedReward.label
        })

    } catch (error: unknown) {
        console.error('Spin Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
