import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
    throw new Error('STRIPE_SECRET_KEY is missing');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-01-27-ac', // Use the latest stable version or current one
    appInfo: {
        name: 'Revio SaaS',
        version: '0.1.0',
    },
});
