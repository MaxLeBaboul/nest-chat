import { Injectable, RawBodyRequest } from '@nestjs/common';
import { type Request as ResquestType } from 'express';
import { DatabaseService } from 'src/database/database.service';
import Stripe from 'stripe';

@Injectable()
export class StripeService {
  private readonly stripe: Stripe;
  private readonly databaseService: DatabaseService;

  constructor() {
    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2024-04-10',
    });
  }

  async createConnectedAccount({
    userId,
  }: {
    userId: string;
  }): Promise<{ accountLink: string }> {
    const existingUser = await this.databaseService.user.findUniqueOrThrow({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        stripeAccountId: true,
      },
    });
    if (existingUser.stripeAccountId) {
      const accountLink = await this.createAccountLink({
        stripeAccountId: existingUser.stripeAccountId,
      });

      return { accountLink: accountLink.url };
    }

    const stripeAccount = await this.stripe.accounts.create({
      type: 'express',
      email: existingUser.email,
      default_currency: 'EUR',
    });

    await this.databaseService.user.update({
      where: {
        id: userId,
      },
      data: {
        stripeAccountId: stripeAccount.id,
      },
    });

    const accountLink = await this.createAccountLink({
      stripeAccountId: stripeAccount.id,
    });

    return { accountLink: accountLink.url };
  }

  async createAccountLink({ stripeAccountId }: { stripeAccountId: string }) {
    return await this.stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${process.env.BACKEND_URL}/onboarding`,
      return_url: `${process.env.BACKEND_URL}`,
      type: 'account_onboarding',
    });
  }

  async getStripeAccount({ stripeAccountId }: { stripeAccountId: string }) {
    const stripeAccount = await this.stripe.accounts.retrieve(stripeAccountId);
    const CanReceiveMoney = stripeAccount.charges_enabled;

    return {
      stripeAccount,
      CanReceiveMoney,
    };
  }

  async createDonation({
    receivingUserId,
    givingUserId,
  }: {
    receivingUserId: string;
    givingUserId: string;
  }): Promise<{ error: boolean; message: string; sessionUrl: string | null }> {
    try {
      if (receivingUserId === givingUserId) {
        throw new Error('Vous ne pouvez pas faire un don à vous même');
      }
      const [receivingUser, givingUser] = await Promise.all([
        this.databaseService.user.findUniqueOrThrow({
          where: {
            id: receivingUserId,
          },
          select: {
            id: true,
            email: true,
            firstName: true,
            stripeAccountId: true,
            stripeProductId: true,
          },
        }),
        this.databaseService.user.findUniqueOrThrow({
          where: {
            id: givingUserId,
          },
          select: {
            id: true,
            stripeAccountId: true,
          },
        }),
      ]);

      if (!receivingUser.stripeAccountId) {
        throw new Error(
          "L'utilisateur n'a pas de compte stripe et ne peux pas recevoir de don",
        );
      }

      if (!givingUser.stripeAccountId) {
        throw new Error(
          "L'utilisateur envoyant le don n'a pas de compte stripe",
        );
      }
      const stripeAccount = await this.stripe.accounts.retrieve(
        receivingUser.stripeAccountId,
      );

      let { stripeProductId } = receivingUser;
      if (!stripeProductId) {
        const product = await this.stripe.products.create({
          name: `Soutenez ${receivingUser.firstName}`,
        });

        await this.databaseService.user.update({
          where: {
            id: receivingUser.id,
          },
          data: {
            stripeProductId: product.id,
          },
        });
        stripeProductId = product.id;
      }

      const price = await this.stripe.prices.create({
        product: stripeProductId,
        currency: 'EUR',
        custom_unit_amount: {
          enabled: true,
        },
      });

      const createDonation = await this.databaseService.donation.create({
        data: {
          stripePriceId: price.id,
          stripeProductId: stripeProductId,
          receivingUser: {
            connect: {
              id: givingUser.id,
            },
          },
          givingUser: {
            connect: {
              id: receivingUser.id,
            },
          },
        },
      });

      const session = await this.stripe.checkout.sessions.create({
        line_items: [
          {
            quantity: 1,
            price: price.id,
          },
        ],
        payment_intent_data: {
          application_fee_amount: 0,
          metadata: {
            donationId: createDonation.id,
          },
          transfer_data: {
            destination: stripeAccount.id,
          },
        },
        mode: 'payment',

        success_url: `${process.env.FRONTEND_URL}/success`,
        cancel_url: `${process.env.FRONTEND_URL}/cancel`,
      });
      return {
        error: false,
        message: 'Donation créée avec succès',
        sessionUrl: session.url,
      };
    } catch (error) {
      if (error instanceof Error) {
        return {
          error: true,
          message: error.message,
          sessionUrl: null,
        };
      }
    }
  }

  async handleWebhook({
    request,
  }: {
    request: RawBodyRequest<ResquestType>;
  }): Promise<{ error: boolean; message: string }> {
    try {
      const sig = request.headers['stripe-signature'];

      const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

      if (!endpointSecret) {
        throw new Error('Endpoint secret is not defined');
      }

      const event = await this.stripe.webhooks.constructEvent(
        request.rawBody,
        sig,
        endpointSecret,
      );

      //Handle the event
      switch (event.type) {
        case 'payment_intent.succeeded':
          const paymentIntentSucceeded = event.data
            .object as Stripe.PaymentIntent;
          const amount = paymentIntentSucceeded.amount;
          const donationId = paymentIntentSucceeded.metadata.donationId;

          console.log({ amount, donationId });
          await this.databaseService.donation.update({
            where: {
              id: donationId,
            },
            data: {
              amount: amount,
            },
          });

          break;
        default:
          console.log(`Unhandled event type: ${event.type}`);
      }
      return {
        error: false,
        message: 'Webhook handled successfully',
      };
    } catch (error) {
      console.error(`Webhook Error: ${error.message}`);
      return {
        error: true,
        message: `Webhook Error: ${error.message}`,
      };
    }
  }
}
