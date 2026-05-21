import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

function generateCardCode(): string {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'
    let code = 'FID-'
    for (let i = 0; i < 8; i++) {
        code += chars[Math.floor(Math.random() * chars.length)]
    }
    return code
}

export async function POST(request: Request) {
    try {
        const { sessionId, deviceFingerprint } = await request.json()
        const supabase = createAdminClient()

        // 1. Verify session exists and has a rating (flow completed)
        const { data: session, error: sessError } = await supabase
            .from('sessions')
            .select('*, campaigns(restaurant_id)')
            .eq('id', sessionId)
            .not('rating', 'is', null)
            .single()

        if (sessError || !session) {
            return NextResponse.json({ error: 'Session invalide ou parcours incomplet' }, { status: 400 })
        }

        const restaurantId = session.campaigns.restaurant_id

        // 2. Get or auto-create loyalty program for this restaurant
        let { data: program } = await supabase
            .from('loyalty_programs')
            .select('*')
            .eq('restaurant_id', restaurantId)
            .eq('is_active', true)
            .single()

        if (!program) {
            const { data: newProgram, error: progError } = await supabase
                .from('loyalty_programs')
                .insert([{
                    restaurant_id: restaurantId,
                    name: 'Programme de fidélité',
                    points_per_visit: 1,
                    reward_threshold: 10,
                    reward_description: 'Récompense offerte',
                    is_active: true
                }])
                .select()
                .single()

            if (progError || !newProgram) {
                return NextResponse.json({ error: 'Impossible de créer le programme' }, { status: 500 })
            }
            program = newProgram
        }

        // 3. Returning customer — same device fingerprint
        if (deviceFingerprint) {
            const { data: existingCard } = await supabase
                .from('loyalty_cards')
                .select('*')
                .eq('loyalty_program_id', program.id)
                .eq('device_fingerprint', deviceFingerprint)
                .single()

            if (existingCard) {
                const newBalance = existingCard.points_balance + program.points_per_visit

                await supabase
                    .from('loyalty_cards')
                    .update({ points_balance: newBalance })
                    .eq('id', existingCard.id)

                await supabase
                    .from('loyalty_transactions')
                    .insert([{
                        loyalty_card_id: existingCard.id,
                        points_added: program.points_per_visit,
                        note: 'Visite'
                    }])

                return NextResponse.json({
                    cardCode: existingCard.card_code,
                    pointsBalance: newBalance,
                    rewardThreshold: program.reward_threshold,
                    rewardDescription: program.reward_description,
                    isNewCard: false
                })
            }
        }

        // 4. New customer — generate unique card code
        let cardCode = generateCardCode()
        let attempts = 0
        while (attempts < 5) {
            const { data: existing } = await supabase
                .from('loyalty_cards')
                .select('id')
                .eq('card_code', cardCode)
                .single()
            if (!existing) break
            cardCode = generateCardCode()
            attempts++
        }

        const { data: newCard, error: cardError } = await supabase
            .from('loyalty_cards')
            .insert([{
                loyalty_program_id: program.id,
                session_id: sessionId,
                card_code: cardCode,
                points_balance: program.points_per_visit,
                device_fingerprint: deviceFingerprint || null
            }])
            .select()
            .single()

        if (cardError || !newCard) {
            return NextResponse.json({ error: 'Impossible de créer la carte' }, { status: 500 })
        }

        await supabase
            .from('loyalty_transactions')
            .insert([{
                loyalty_card_id: newCard.id,
                points_added: program.points_per_visit,
                note: '1ère visite'
            }])

        await supabase
            .from('analytics_events')
            .insert([{ session_id: sessionId, event_type: 'wallet_card_created' }])

        return NextResponse.json({
            cardCode: newCard.card_code,
            pointsBalance: newCard.points_balance,
            rewardThreshold: program.reward_threshold,
            rewardDescription: program.reward_description,
            isNewCard: true
        })

    } catch (error) {
        console.error('Loyalty create error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
