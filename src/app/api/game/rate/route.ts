import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import { v4 as uuidv4 } from 'uuid'

export async function POST(request: Request) {
    try {
        const { campaignId, sessionId, rating, feedback } = await request.json()
        const supabase = await createClient()

        // 1. Get session and reward info
        const { data: session, error: sessError } = await supabase
            .from('sessions')
            .select('*, rewards(id, is_prize), campaigns(restaurant_id)')
            .eq('id', sessionId)
            .eq('campaign_id', campaignId)
            .single()

        if (sessError || !session) return NextResponse.json({ error: 'Session invalide' }, { status: 400 })
        if (session.rating) return NextResponse.json({ error: 'Déjà noté' }, { status: 400 })

        // 2. Update session with rating and feedback
        await supabase.from('sessions').update({
            rating,
            feedback
        }).eq('id', sessionId)

        // 3. Generate unique coupon code (ONLY IF IT'S A REAL PRIZE)
        if (session.rewards?.is_prize) {
            const couponCode = Math.random().toString(36).substring(2, 8).toUpperCase()
            const expiresAt = new Date()
            expiresAt.setMinutes(expiresAt.getMinutes() + 10) // 10 minutes par défaut

            // 4. Create coupon in DB
            const { error: couponError } = await supabase
                .from('coupons')
                .insert([{
                    session_id: sessionId,
                    code: couponCode,
                    expires_at: expiresAt.toISOString(),
                    status: 'unused'
                }])

            if (couponError) throw couponError
        }

        // 5. Track events
        await supabase.from('analytics_events').insert([
            { session_id: sessionId, event_type: 'rating_submitted' },
            { session_id: sessionId, event_type: 'reward_revealed' }
        ])

        return NextResponse.json({ success: true })

    } catch (error: any) {
        console.error('Rate Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
