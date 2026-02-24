import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
    try {
        const { planType } = await req.json();
        const supabase = await createClient();

        // 1. Get price ID from server env
        const priceId = planType === 'monthly'
            ? process.env.STRIPE_MONTHLY_PRICE_ID
            : process.env.STRIPE_ANNUAL_PRICE_ID;

        if (!priceId) {
            return NextResponse.json({ error: 'Config Stripe manquante (Price ID)' }, { status: 500 });
        }

        // 2. Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });
        }

        // 3. Get restaurant ID and existing Stripe customer reference
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, name, stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) {
            return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });
        }

        // 4. Check if they already had a trial/subscription record
        const { data: existingSub } = await supabase
            .from('subscriptions')
            .select('id')
            .eq('restaurant_id', restaurant.id)
            .maybeSingle();

        const hasHadTrial = !!existingSub;

        // 5. Create Stripe Checkout Session
        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: restaurant.stripe_customer_id || undefined,
            customer_email: restaurant.stripe_customer_id ? undefined : user.email,
            line_items: [
                {
                    price: priceId,
                    quantity: 1,
                },
            ],
            subscription_data: {
                trial_period_days: hasHadTrial ? undefined : 7,
                metadata: {
                    restaurantId: restaurant.id,
                    userId: user.id
                }
            },
            allow_promotion_codes: true,
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`,
            metadata: {
                restaurantId: restaurant.id,
                userId: user.id
            }
        });

        return NextResponse.json({ url: session.url });

    } catch (error: any) {
        console.error('Stripe Checkout Error:', error);
        return NextResponse.json({
            error: error.message || 'Erreur lors de la création de la session de paiement'
        }, { status: 500 });
    }
}
