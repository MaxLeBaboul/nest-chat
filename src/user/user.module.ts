import { Module } from '@nestjs/common';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { DatabaseService } from 'src/database/database.service';
import { StripeService } from 'src/stripe/stripe.service';
import { UserController } from './user.controller';
import { UserService } from './user.service';

@Module({
  controllers: [UserController],
  providers: [UserService, DatabaseService, AwsS3Service, StripeService],
})
export class UserModule {}
