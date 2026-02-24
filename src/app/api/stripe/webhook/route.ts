import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { safeStripeDate } from '@/lib/stripe-utils';

const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

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
                    if (!restaurantId) {
                        console.error('❌ No restaurantId found in session metadata');
                        return NextResponse.json({ error: 'restaurantId missing in metadata' }, { status: 400 });
                    }

                    console.log(`✅ Checkout completed for restaurant: ${restaurantId}`);

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
                    });

                    if (error) {
                        console.error('❌ Error updating subscription in Supabase:', error);
                        throw error;
                    }
                }
                break;
            }

            case 'customer.subscription.updated': {
                const subscription = event.data.object as any;
                console.log(`🔄 Subscription updated: ${subscription.id}`);

                const { error } = await supabaseAdmin.from('subscriptions').update({
                    status: subscription.status,
                    plan_id: subscription.items.data[0].price.id,
                    cancel_at_period_end: subscription.cancel_at_period_end,
                    current_period_end: safeStripeDate(subscription.current_period_end),
                    trial_end: safeStripeDate(subscription.trial_end),
                    canceled_at: safeStripeDate(subscription.canceled_at),
                    cancel_at: safeStripeDate(subscription.cancel_at)
                })
                    .eq('stripe_subscription_id', subscription.id);

                if (error) console.error('❌ Error updating subscription (update):', error);
                break;
            }

            case 'customer.subscription.deleted': {
                const subscription = event.data.object as any;
                console.log(`🚫 Subscription deleted: ${subscription.id}`);

                const { error } = await supabaseAdmin.from('subscriptions').update({
                    status: 'canceled',
                    cancel_at_period_end: false,
                    current_period_end: safeStripeDate(subscription.current_period_end),
                    canceled_at: safeStripeDate(subscription.canceled_at || Math.floor(Date.now() / 1000))
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
