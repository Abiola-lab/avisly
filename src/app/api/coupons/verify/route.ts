import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { code } = await request.json()
        const supabase = await createClient()

        // 1. Get coupon with related session and campaign
        const { data: coupon, error: couponError } = await supabase
            .from('coupons')
            .select('*, sessions(reward_id, campaigns(restaurant_id)), rewards:sessions(reward_id)')
            .eq('code', code.toUpperCase())
            .single()

        if (couponError || !coupon) {
            return NextResponse.json({ error: 'Code invalide ou introuvable' }, { status: 404 })
        }

        // 2. Security: Verify current user owns the restaurant of this coupon
        const { data: { user } } = await supabase.auth.getUser()
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user?.id)
            .single()

        if (restaurant?.id !== coupon.sessions.campaigns.restaurant_id) {
            return NextResponse.json({ error: 'Ce coupon ne vous appartient pas' }, { status: 403 })
        }

        // 3. Status checks
        if (coupon.status === 'used') {
            return NextResponse.json({ error: 'Ce coupon a déjà été utilisé' }, { status: 400 })
        }

        const isExpired = new Date(coupon.expires_at).getTime() < new Date().getTime()
        if (isExpired || coupon.status === 'expired') {
            return NextResponse.json({ error: 'Ce coupon a expiré' }, { status: 400 })
        }

        // 4. Validate coupon
        const { error: updateError } = await supabase
            .from('coupons')
            .update({
                status: 'used',
                used_at: new Date().toISOString()
            })
            .eq('id', coupon.id)

        if (updateError) throw updateError

        // 5. Fetch reward label for feedback
        const { data: reward } = await supabase
            .from('rewards')
            .select('label')
            .eq('id', coupon.sessions.reward_id)
            .single()

        // 6. Track event
        await supabase.from('analytics_events').insert([{
            session_id: coupon.session_id,
            event_type: 'coupon_validated'
        }])

        return NextResponse.json({
            success: true,
            rewardLabel: reward?.label
        })

    } catch (error: any) {
        console.error('Verify Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
