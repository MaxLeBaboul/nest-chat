import {
  Controller,
  Param,
  Post,
  RawBodyRequest,
  Request,
  UseGuards,
} from '@nestjs/common';

import { type Request as ResquestType } from 'express';
import { RequestWhithUser } from 'src/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth-guard';
import { StripeService } from './stripe.service';

@Controller('stripe')
export class StripeController {
  constructor(private readonly stripeService: StripeService) {}

  @UseGuards(JwtAuthGuard)
  @Post('connect')
  async getConversations(
    @Request() request: RequestWhithUser,
  ): Promise<{ accountLink: string }> {
    return await this.stripeService.createConnectedAccount({
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Post('connect/:receivingUserId')
  async createDonation(
    @Param('receivingUserId') receivingUserId: string,
    @Request() request: RequestWhithUser,
  ): Promise<{ error: boolean; message: string; sessionUrl: string | null }> {
    return await this.stripeService.createDonation({
      givingUserId: request.user.userId,
      receivingUserId,
    });
  }

  @Post('webhook')
  async handleWebhook(
    @Request() request: RawBodyRequest<ResquestType>,
  ): Promise<{ error: boolean; message: string }> {
    return await this.stripeService.handleWebhook({
      request,
    });
  }
}
