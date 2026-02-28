import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    try {
        const { campaignId } = await request.json()
        const supabase = await createClient()

        // Get IP (handling multiple proxy hops)
        const forwardFor = request.headers.get('x-forwarded-for')
        const ip = forwardFor ? forwardFor.split(',')[0] : '127.0.0.1'

        // SÉCURITÉ : Limite de participation (Anti-fraude)
        // Pour les tests en local (localhost), on peut être plus souple
        const isLocal = ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.')

        // 1. Check if a session already exists for this IP in the last 24h for THIS campaign
        const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()

        const { data: existingSessions } = await supabase
            .from('sessions')
            .select('id')
            .eq('campaign_id', campaignId)
            .eq('ip_address', ip)
            .gt('created_at', twentyFourHoursAgo)
            .limit(1)

        const { data: { user } } = await supabase.auth.getUser()
        const adminEmails = ['akobiabiola0@gmail.com', 'hakim.digital05@gmail.com']
        const isAdmin = user && adminEmails.includes(user.email || '')

        // On bloque si déjà joué, sauf si on est en local, ou si c'est un admin (pour les tests)
        if (existingSessions && existingSessions.length > 0 && !isLocal && !isAdmin) {
            return NextResponse.json({
                error: 'FRAUD_LIMIT',
                message: 'Vous avez déjà participé aujourd\'hui avec ce téléphone. Revenez demain !'
            }, { status: 403 })
        }

        // 2. Create new session
        const { data: session, error: sessError } = await supabase
            .from('sessions')
            .insert([{ campaign_id: campaignId, ip_address: ip }])
            .select()
            .single()

        if (sessError) throw sessError

        // 3. Track scan event
        await supabase.from('analytics_events').insert([{
            session_id: session.id,
            event_type: 'scan'
        }])

        return NextResponse.json({ sessionId: session.id })

    } catch (error: any) {
        console.error('Init Error:', error)
        return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
    }
}
