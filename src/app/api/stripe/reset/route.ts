import { createClient } from '@/lib/supabase/server';
import { stripe } from '@/lib/stripe';
import { NextResponse } from 'next/server';

/**
 * DEBUG ROUTE - A ne pas laisser tel quel en production sans protection.
 * Permet de supprimer l'état d'abonnement pour tester le flux de vente à nouveau.
 */
export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // --- PROTECTION ADMIN ---
        const debugEnabled = process.env.DEBUG_TOOLS_ENABLED === 'true';
        const adminEmail = process.env.ADMIN_EMAIL;

        if (!debugEnabled || user.email !== adminEmail) {
            console.warn(`🔒 Tentative d'accès non autorisée au Reset DB par ${user.email}`);
            return NextResponse.json({ error: 'Accès interdit' }, { status: 403 });
        }
        // ------------------------

        const body = await req.json().catch(() => ({}));
        const fullReset = body.fullReset === true;

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
        }

        // Always delete the subscription
        const { error: subError } = await supabase
            .from('subscriptions')
            .delete()
            .eq('restaurant_id', restaurant.id);

        if (subError) throw subError;

        if (fullReset) {
            // Delete the restaurant — cascades campaigns, rewards, sessions, coupons, analytics
            const { error: restError } = await supabase
                .from('restaurants')
                .delete()
                .eq('id', restaurant.id);

            if (restError) throw restError;

            return NextResponse.json({ success: true, fullReset: true, message: 'Compte remis à zéro — redirection vers l\'onboarding.' });
        }

        return NextResponse.json({ success: true, fullReset: false, message: 'Abonnement réinitialisé en base locale (Supabase)' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
