import { stripe } from '@/lib/stripe';
import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';
import { safeStripeDate } from '@/lib/stripe-utils';

export async function POST(req: Request) {
    try {
        const { sessionId } = await req.json();
        if (!sessionId) return NextResponse.json({ error: 'sessionId required' }, { status: 400 });

        const supabase = await createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return NextResponse.json({ error: 'Non authentifié' }, { status: 401 });

        const session = await stripe.checkout.sessions.retrieve(sessionId);

        const plan = session.metadata?.plan;
        const restaurantId = session.metadata?.restaurantId;

        if (!plan || !restaurantId) {
            return NextResponse.json({ error: 'Métadonnées manquantes' }, { status: 400 });
        }

        // Verify ownership
        const { data: restaurant } = await supabase
            .from('restaurants')
            .select('id')
            .eq('user_id', user.id)
            .eq('id', restaurantId)
            .single();

        if (!restaurant) return NextResponse.json({ error: 'Accès refusé' }, { status: 403 });

        // Save plan and customer ID to restaurant
        await supabase
            .from('restaurants')
            .update({ stripe_customer_id: session.customer as string, subscription_plan: plan })
            .eq('id', restaurantId);

        // Save full subscription data
        if (session.subscription) {
            const stripeSub = await stripe.subscriptions.retrieve(session.subscription as string) as any;
            await supabase.from('subscriptions').upsert({
                restaurant_id: restaurantId,
                stripe_customer_id: session.customer as string,
                stripe_subscription_id: session.subscription as string,
                status: stripeSub.status,
                plan_id: stripeSub.items.data[0].price.id,
                cancel_at_period_end: stripeSub.cancel_at_period_end,
                current_period_end: safeStripeDate(stripeSub.current_period_end),
                trial_end: safeStripeDate(stripeSub.trial_end),
                canceled_at: safeStripeDate(stripeSub.canceled_at),
                cancel_at: safeStripeDate(stripeSub.cancel_at),
            }, { onConflict: 'restaurant_id' });
        }

        return NextResponse.json({ success: true, plan });

    } catch (error: any) {
        console.error('Verify Checkout Error:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
