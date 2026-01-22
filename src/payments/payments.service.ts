import { Injectable } from '@nestjs/common';
import { envs } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.STRIPE_API_KEY_SECRET);

  constructor() {}

  async createPaymentSession(paymentSession: PaymentSessionDto) {
    const { currency, items } = paymentSession;
    const line_items = items.map((item) => ({
      price_data: {
        currency,
        product_data: {
          name: item.name,
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    const session = await this.stripe.checkout.sessions.create({
      // Id de Orden Y Id de Usuario
      payment_intent_data: {
        metadata: {
          orderId: 'test-order-id',
          userId: 'test-user-id',
        },
      },
      success_url: 'http://localhost:4400/payments/success',
      cancel_url: 'http://localhost:4400/payments/cancel',
      payment_method_types: ['card'],
      mode: 'payment',
      line_items,
    });
    return session;
  }

  stripeWebhookHandler(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];

    let event;
    const endpointSecret = envs.STRIPE_ENDPOINT_SECRET;

    if (!sig) {
      return res.status(400).send('Webhook Error: No signature found');
    }

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
    } catch (err: any) {
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }
    if (!event && !event.type) {
      return res.status(400).send('Webhook Error: No event found');
    }
    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded':
        const paymentIntent = event.data.object;
        console.log('PaymentIntent was successful!');
        break;
      case 'payment_method.attached':
        const paymentMethod = event.data.object;
        console.log('PaymentMethod was attached to a Customer!');
        break;
      // ... handle other event types
      default:
        console.log(`Unhandled event type ${event.type}`);
    }

    console.log('Webhook received:', event);

    // Return a 200 response to acknowledge receipt of the event
    return res.json({received: true});
  }
}
