import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { Request, Response } from 'express';
import { PaymentsService } from './payments.service';
import { PaymentSessionDto } from './dto/payment-session.dto';

@Controller('payments')
export class PaymentsController {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Post('create-session')
  async createPaymentSession(@Body() body: PaymentSessionDto) {
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
