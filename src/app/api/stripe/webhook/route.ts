import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { safeStripeDate } from '@/lib/stripe-utils';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const PRICE_TO_PLAN: Record<string, string> = {
    [process.env.STRIPE_ROUE_MONTHLY_PRICE_ID!]:    'roue',
    [process.env.STRIPE_ROUE_ANNUAL_PRICE_ID!]:     'roue',
    [process.env.STRIPE_FIDELITE_MONTHLY_PRICE_ID!]: 'fidelite',
    [process.env.STRIPE_FIDELITE_ANNUAL_PRICE_ID!]:  'fidelite',
    [process.env.STRIPE_FULLPRO_MONTHLY_PRICE_ID!]:  'full_pro',
    [process.env.STRIPE_FULLPRO_ANNUAL_PRICE_ID!]:   'full_pro',
};

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    if (!webhookSecret) {
        console.error('❌ STRIPE_WEBHOOK_SECRET is not set');
        return NextResponse.json({ error: 'Webhook secret missing' }, { status: 500 });
    }

    let event;

    try {
        event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
        console.error(`❌ Webhook Signature Validation Failed: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    console.log(`🔔 Webhook received: ${event.type} [${event.id}]`);

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed': {
                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId) as any;
                    const restaurantId = session.metadata?.restaurantId;
                    const plan = session.metadata?.plan;

                    if (!restaurantId) {
                        console.error(`❌ No restaurantId found for session ${session.id} [${event.id}]`);
                        return NextResponse.json({ error: 'restaurantId missing in metadata' }, { status: 400 });
                    }

                    // Save customer ID + plan to restaurant
                    await supabaseAdmin
                        .from('restaurants')
                        .update({
                            stripe_customer_id: session.customer as string,
                            ...(plan ? { subscription_plan: plan } : {})
                        })
                        .eq('id', restaurantId);

                    console.log(`✅ Checkout completed for restaurant: ${restaurantId}, plan: ${plan} (Event: ${event.id})`);

                    const { error } = await supabaseAdmin.from('subscriptions').upsert({
                        restaurant_id: restaurantId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                        status: subscription.status,
                        plan_id: subscription.items.data[0].price.id,
                        cancel_at_period_end: subscription.cancel_at_period_end,
                        current_period_end: safeStripeDate(subscription.current_period_end),
                        trial_end: safeStripeDate(subscription.trial_end),
                        canceled_at: safeStripeDate(subscription.canceled_at),
                        cancel_at: safeStripeDate(subscription.cancel_at)
                    }, { onConflict: 'restaurant_id' });

                    if (error) {
                        console.error('❌ Error updating subscription in Supabase:', error);
                        throw error;
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log(`🔄 Subscription updated: ${subscription.id} (Status: ${subscription.status}, CancelAtPeriodEnd: ${subscription.cancel_at_period_end})`);

                const newPriceId = subscription.items.data[0].price.id;

                const { error } = await supabaseAdmin.from('subscriptions').update({
                    status: subscription.status,
                    plan_id: newPriceId,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: safeStripeDate(subscription.current_period_end),
                    trial_end: safeStripeDate(subscription.trial_end),
                    canceled_at: safeStripeDate(subscription.canceled_at),
                    cancel_at: safeStripeDate(subscription.cancel_at)
                })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) console.error('❌ Error updating subscription (update):', error);

                // Sync plan type to restaurants table
                const newPlan = PRICE_TO_PLAN[newPriceId];
                if (newPlan) {
                    const { data: subRecord } = await supabaseAdmin
                        .from('subscriptions')
                        .select('restaurant_id')
                        .eq('stripe_subscription_id', subscription.id)
                        .single();
                    if (subRecord?.restaurant_id) {
                        await supabaseAdmin
                            .from('restaurants')
                            .update({ subscription_plan: newPlan })
                            .eq('id', subRecord.restaurant_id);
                    }
                }
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log(`🚫 Subscription deleted: ${subscription.id}`);

                const { error } = await supabaseAdmin.from('subscriptions').update({
                    status: 'canceled',
                    cancel_at_period_end: false,
                    current_period_end: safeStripeDate(subscription.current_period_end),
                    canceled_at: safeStripeDate(subscription.canceled_at || Math.floor(Date.now() / 1000)),
                    cancel_at: null // Une fois supprimé, la date d'annulation prévue n'a plus lieu d'être
                })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) console.error('❌ Error updating subscription (delete):', error);
                break;
            }

            default:
                console.log(`⚠️ Unhandled event type: ${event.type}`);
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('❌ Webhook processing failed:', error.message);
        return NextResponse.json({
            error: 'Webhook processing failed',
            details: error.message
        }, { status: 500 });
    }
}
