import Stripe from 'stripe';

const key = process.env.STRIPE_SECRET_KEY || 'sk_test_DUMMY_FOR_BUILD';

export const stripe = new Stripe(key, {
  apiVersion: '2025-02-24-preview', // Update to latest compatible version
  typescript: true,
});
