import { Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { PaymentMessage } from './enums/payment.enum';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  @MessagePattern(PaymentMessage.CREATE_PAYMENT_SESSION)
  async createPaymentSession(@Payload() body: PaymentSessionDto) {
    return await this.paymentsService.createPaymentSession(body);
  }

  @Post('stripe-webhook')
  stripeWebhook(@Req() request: Request, @Res() response: Response) {
    return this.paymentsService.stripeWebhookHandler(request, response);
  }

  @Get('success')
  getSuccess() {
    return {
      ok: true,
      message: 'Payment successful',
    };
  }

  @Get('cancel')
  cancel() {
    return {
      ok: false,
      message: 'Payment cancelled',
    };
  }
}
