import { createAdminClient } from '@/lib/supabase/admin'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { cardCode, firstName, lastName, email, phone, smsOptIn } = await request.json()

        if (!cardCode || !firstName || !lastName || !email) {
            return NextResponse.json({ error: 'Prénom, nom et email requis' }, { status: 400 })
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(email)) {
            return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
        }

        const admin = createAdminClient()

        const { data: card, error: cardError } = await admin
            .from('loyalty_cards')
            .select('id')
            .eq('card_code', cardCode.toUpperCase())
            .single()

        if (cardError || !card) {
            return NextResponse.json({ error: 'Carte introuvable' }, { status: 404 })
        }

        const { error: updateError } = await admin
            .from('loyalty_cards')
            .update({
                customer_first_name: firstName.trim(),
                customer_last_name: lastName.trim(),
                customer_email: email.toLowerCase().trim(),
                customer_phone: phone ? phone.trim() : null,
                sms_opt_in: smsOptIn && !!phone
            })
            .eq('id', card.id)

        if (updateError) throw updateError

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Contact save error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
