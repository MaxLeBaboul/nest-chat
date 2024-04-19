import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { DatabaseService } from 'src/database/database.service';
import { StripeController } from './stripe.controller';
import { StripeService } from './stripe.service';

@Module({
  imports: [ConfigModule.forRoot({ isGlobal: true })],
  controllers: [StripeController],
  providers: [StripeService, DatabaseService],
})
export class StripeModule {}
