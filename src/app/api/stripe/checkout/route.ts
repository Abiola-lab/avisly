import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import type { PlanType } from '@/lib/plans';

const PRICE_IDS: Record<PlanType, { monthly: string; annual: string }> = {
    roue: {
        monthly: process.env.STRIPE_ROUE_MONTHLY_PRICE_ID!,
        annual:  process.env.STRIPE_ROUE_ANNUAL_PRICE_ID!,
    },
    fidelite: {
        monthly: process.env.STRIPE_FIDELITE_MONTHLY_PRICE_ID!,
        annual:  process.env.STRIPE_FIDELITE_ANNUAL_PRICE_ID!,
    },
    full_pro: {
        monthly: process.env.STRIPE_FULLPRO_MONTHLY_PRICE_ID!,
        annual:  process.env.STRIPE_FULLPRO_ANNUAL_PRICE_ID!,
    },
}

export async function POST(req: Request) {
    try {
        const { plan, billing } = await req.json() as { plan: PlanType; billing: 'monthly' | 'annual' };

        const priceId = PRICE_IDS[plan]?.[billing];
        if (!priceId) {
            return NextResponse.json({ error: 'Config Stripe manquante (Price ID)' }, { status: 500 });
        }

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id, name, stripe_customer_id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });

        const session = await stripe.checkout.sessions.create({
            mode: 'subscription',
            payment_method_types: ['card'],
            customer: restaurant.stripe_customer_id || undefined,
            customer_email: restaurant.stripe_customer_id ? undefined : user.email,
            line_items: [{ price: priceId, quantity: 1 }],
            subscription_data: {
                metadata: {
                    restaurantId: restaurant.id,
                    userId: user.id,
                    plan,
                }
            },
            allow_promotion_codes: true,
            success_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings?session_id={CHECKOUT_SESSION_ID}`,
            cancel_url: `${process.env.NEXT_PUBLIC_SITE_URL}/dashboard/settings`,
            metadata: {
                restaurantId: restaurant.id,
                userId: user.id,
                plan,
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
