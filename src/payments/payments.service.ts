import { Inject, Injectable } from '@nestjs/common';
import { envs, NATS_SERVICE } from 'src/config';
import Stripe from 'stripe';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { Request, Response } from 'express';
import { IStripeCheckoutSession } from 'src/Interfaces/session.interface';
import {
  IStripeWebhookEvent,
  IPaymentIntentMetadata,
} from 'src/Interfaces/webhook.interface';
import { ClientProxy } from '@nestjs/microservices';
import { WebhookMessage } from './enums/payment.enum';

@Injectable()
export class PaymentsService {
  private readonly stripe = new Stripe(envs.stripeApiKeySecret);

  constructor(
    @Inject(NATS_SERVICE)
    private readonly natsClient: ClientProxy,
  ) {}

  async createPaymentSession(paymentSession: PaymentSessionDto) {
    const { currency, items, orderId, userId } = paymentSession;
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

    const session: IStripeCheckoutSession =
      await this.stripe.checkout.sessions.create({
        // Id de Orden Y Id de Usuario
        payment_intent_data: {
          metadata: {
            orderId: orderId,
            userId: userId,
          },
        },
        success_url: envs.stripeSuccessUrl,
        cancel_url: envs.stripeCancelUrl,
        payment_method_types: ['card'],
        mode: 'payment',
        line_items,
      });
    return session;
  }

  stripeWebhookHandler(req: Request, res: Response) {
    const sig: string | string[] | undefined = req.headers['stripe-signature'];
    const endpointSecret = envs.stripeWebhookSigningSecret;

    if (!sig) {
      return res.status(400).send('Webhook Error: No signature found');
    }

    let event: IStripeWebhookEvent;

    try {
      event = this.stripe.webhooks.constructEvent(
        req['rawBody'],
        sig,
        endpointSecret,
      );
      console.log('Webhook received:', event);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      return res.status(400).send(`Webhook Error: ${errorMessage}`);
    }

    // Handle the event
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const paymentData = event.data.object;
        const metadata = paymentData.metadata as IPaymentIntentMetadata;
        const paymentId = paymentData.id;
        const { orderId, userId } = metadata;
        const dataToSend = {
          paymentId,
          orderId,
          userId,
          paymentData,
        };
        // send event payment receive
        this.natsClient.emit(
          { cmd: WebhookMessage.WEBHOOK_CONFIRMATION_PAYMENT },
          dataToSend,
        );
        break;
      }
      case 'payment_method.attached': {
        const paymentMethod = event.data.object;
        console.log('PaymentMethod was attached to a Customer!');
        console.log('Payment Method ID:', paymentMethod.id);
        break;
      }
      // ... handle other event types
      default:
        console.error(`Unhandled event type ${event.type}`);
    }

    // Return a 200 response to acknowledge receipt of the event
    return res.json({ received: true });
  }
}
