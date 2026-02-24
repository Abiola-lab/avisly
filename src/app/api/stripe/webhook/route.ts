import { stripe } from '@/lib/stripe';
import { createClient } from '@supabase/supabase-js';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

// Note: Use Service Role Key for Admin access in webhook
const supabaseAdmin = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: Request) {
    const body = await req.text();
    const signature = (await headers()).get('stripe-signature') as string;

    let event;

    try {
        event = stripe.webhooks.constructEvent(
            body,
            signature,
            process.env.STRIPE_WEBHOOK_SECRET!
        );
    } catch (err: any) {
        console.error(`Webhook Error: ${err.message}`);
        return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
    }

    const session = event.data.object as any;

    try {
        switch (event.type) {
            case 'checkout.session.completed':
                if (session.mode === 'subscription') {
                    const subscriptionId = session.subscription as string;
                    const subscription = await stripe.subscriptions.retrieve(subscriptionId);
                    const restaurantId = session.metadata?.restaurantId;

                    await supabaseAdmin.from('subscriptions').upsert({
                        restaurant_id: restaurantId,
                        stripe_customer_id: session.customer as string,
                        stripe_subscription_id: subscriptionId,
                        status: subscription.status,
                        plan_id: (subscription as any).items.data[0].price.id,
                        current_period_end: new Date((subscription as any).current_period_end * 1000).toISOString()
                    });
                }
                break;

            case 'customer.subscription.updated':
            case 'customer.subscription.deleted':
                const subscription = event.data.object as any;

                await supabaseAdmin.from('subscriptions').update({
                    status: subscription.status,
                    current_period_end: new Date(subscription.current_period_end * 1000).toISOString()
                })
                    .eq('stripe_subscription_id', subscription.id);
                break;
        }

        return NextResponse.json({ received: true });
    } catch (error: any) {
        console.error('Webhook processing failed:', error);
        return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 });
    }
}
