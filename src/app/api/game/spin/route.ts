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

        // 2. Fetch active rewards for the campaign
        const { data: rewards, error: rewError } = await supabase
            .from('rewards')
            .select('*')
            .eq('campaign_id', campaignId)

        if (rewError || !rewards || rewards.length === 0) {
            return NextResponse.json({ error: 'Aucun lot disponible' }, { status: 400 })
        }

        // 3. Pick random reward (equal probability)
        const randomIndex = Math.floor(Math.random() * rewards.length)
        const pickedReward = rewards[randomIndex]

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
            winnerIndex: randomIndex,
            rewardLabel: pickedReward.label
        })

    } catch (error: any) {
        console.error('Spin Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
