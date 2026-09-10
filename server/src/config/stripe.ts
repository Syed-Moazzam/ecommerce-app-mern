import Stripe from 'stripe';
import { env } from './env';

let stripeInstance: Stripe | null = null;

export const getStripe = (): Stripe => {
  if (!env.stripe.secretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }
  if (!stripeInstance) {
    stripeInstance = new Stripe(env.stripe.secretKey, {
      apiVersion: '2025-02-24.acacia',
    });
  }
  return stripeInstance;
};

export const isStripeConfigured = (): boolean => Boolean(env.stripe.secretKey);
