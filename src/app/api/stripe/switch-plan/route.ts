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
            .select('id')
            .eq('user_id', user.id)
            .single();

        if (!restaurant) return NextResponse.json({ error: 'Restaurant non trouvé' }, { status: 404 });

        const { data: sub } = await supabase
            .from('subscriptions')
            .select('stripe_subscription_id')
            .eq('restaurant_id', restaurant.id)
            .single();

        if (!sub?.stripe_subscription_id) {
            return NextResponse.json({ error: 'Aucun abonnement actif trouvé' }, { status: 400 });
        }

        const stripeSub = await stripe.subscriptions.retrieve(sub.stripe_subscription_id);
        const currentItemId = stripeSub.items.data[0].id;

        await stripe.subscriptions.update(sub.stripe_subscription_id, {
            items: [{ id: currentItemId, price: priceId }],
            proration_behavior: 'create_prorations',
            metadata: { plan, restaurantId: restaurant.id, userId: user.id },
        });

        // Update immediately in Supabase — webhook will also fire and confirm
        await supabase
            .from('restaurants')
            .update({ subscription_plan: plan })
            .eq('id', restaurant.id);

        await supabase
            .from('subscriptions')
            .update({ plan_id: priceId })
            .eq('restaurant_id', restaurant.id);

        return NextResponse.json({ success: true });

    } catch (error: any) {
        console.error('Stripe Switch Plan Error:', error);
        return NextResponse.json(
            { error: error.message || 'Erreur lors du changement de plan' },
            { status: 500 }
        );
    }
}
