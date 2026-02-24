import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();

        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // 1. Get restaurant
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
        }

        // 2. Get stripe_customer_id from subscriptions
        const { data: sub } = await supabase
            .from('subscriptions')
            .select('stripe_customer_id')
            .eq('restaurant_id', restaurant.id)
            .single();

        if (!sub?.stripe_customer_id) {
            return NextResponse.json({ error: "Pas de client Stripe trouvé. Veuillez d'abord souscrire à une offre." }, { status: 400 });
        }

        if (!process.env.NEXT_PUBLIC_SITE_URL) {
            console.error('❌ NEXT_PUBLIC_SITE_URL is not set');
            return NextResponse.json({ error: 'Configuration serveur manquante (URL du site)' }, { status: 500 });
        }

        // 3. Create portal session
        const portalSession = await stripe.billingPortal.sessions.create({
            customer: sub.stripe_customer_id,
            return_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?stripe=return`,
        });

        return NextResponse.json({ url: portalSession.url });

    } catch (error: any) {
        console.error('Stripe Portal Error:', error);
        return NextResponse.json({
            error: 'Erreur lors de la création du portail de facturation',
            details: error.message
        }, { status: 500 });
    }
}
