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

        // Get restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
        }

        // Optionnel : Annuler vraiment dans Stripe si on veut nettoyer ?
        // Mais ici on veut juste réinitialiser l'état Supabase pour re-tester le bouton d'achat.

        const { error } = await supabase
            .from('subscriptions')
            .delete()
            .eq('restaurant_id', restaurant.id);

        if (error) throw error;

        return NextResponse.json({ success: true, message: 'Abonnement réinitialisé en base locale (Supabase)' });

    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
