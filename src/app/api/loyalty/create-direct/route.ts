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
        const { restaurantId, deviceFingerprint } = await request.json()
        if (!restaurantId) return NextResponse.json({ error: 'restaurantId requis' }, { status: 400 })

        const supabase = createAdminClient()

        // Check loyalty is enabled for this restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('loyalty_card_enabled')
            .eq('id', restaurantId)
            .single()

        if (restaurant?.loyalty_card_enabled === false) {
            return NextResponse.json({ error: 'Carte de fidélité désactivée' }, { status: 400 })
        }

        // Get or auto-create loyalty program
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

        // Returning device — add a point to existing card
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
                    .insert([{ loyalty_card_id: existingCard.id, points_added: program.points_per_visit, note: 'Visite' }])

                return NextResponse.json({
                    cardCode: existingCard.card_code,
                    pointsBalance: newBalance,
                    rewardThreshold: program.reward_threshold,
                    rewardDescription: program.reward_description,
                    isNewCard: false
                })
            }
        }

        // New card
        let cardCode = generateCardCode()
        for (let i = 0; i < 5; i++) {
            const { data: existing } = await supabase
                .from('loyalty_cards').select('id').eq('card_code', cardCode).single()
            if (!existing) break
            cardCode = generateCardCode()
        }

        const { data: newCard, error: cardError } = await supabase
            .from('loyalty_cards')
            .insert([{
                loyalty_program_id: program.id,
                session_id: null,
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
            .insert([{ loyalty_card_id: newCard.id, points_added: program.points_per_visit, note: '1ère visite' }])

        return NextResponse.json({
            cardCode: newCard.card_code,
            pointsBalance: newCard.points_balance,
            rewardThreshold: program.reward_threshold,
            rewardDescription: program.reward_description,
            isNewCard: true
        })

    } catch (error) {
        console.error('Loyalty create-direct error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
