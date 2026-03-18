export const PLANS = {
  FREE: {
    id: 'free',
    name: 'Starter',
    priceId: '',
  },
  PROFISSIONAL: {
    id: 'profissional',
    name: 'Profissional',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PROFISSIONAL || 'price_1Profissional_ID',
    price: 47,
  },
  PRO: {
    id: 'pro',
    name: 'PRO',
    priceId: process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO || 'price_1PRO_ID',
    price: 97,
  },
};
