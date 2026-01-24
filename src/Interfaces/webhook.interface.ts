import Stripe from 'stripe';

// Tipo para el webhook event completo
export type IStripeWebhookEvent = Stripe.Event;

// Tipo específico para payment_intent.succeeded
export type IPaymentIntentSucceededEvent = Stripe.PaymentIntentSucceededEvent;

// Tipo para el PaymentIntent
export type IStripePaymentIntent = Stripe.PaymentIntent;

// Si necesitas crear tipos personalizados para manejar la metadata, puedes extenderlos:
export interface IPaymentIntentMetadata {
  orderId?: string;
  userId?: string;
  [key: string]: string | undefined;
}
