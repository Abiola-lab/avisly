import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    // Let Stripe use the default SDK version or configured account version
    appInfo: {
        name: 'Avisly SaaS',
        version: '0.1.0',
    },
});
