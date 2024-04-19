import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { DatabaseModule } from 'src/database/database.module';
import { DatabaseService } from 'src/database/database.service';
import { MailerService } from 'src/mailer.service';
import { StripeService } from 'src/stripe/stripe.service';
import { UserService } from 'src/user/user.service';
import { JwtStrategy } from '../guard/jwt.strategy';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    DatabaseModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '30d' },
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    DatabaseService,
    JwtStrategy,
    UserService,
    MailerService,
    AwsS3Service,
    StripeService,
  ],
})
export class AuthModule {}
