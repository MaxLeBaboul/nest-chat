import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';
import { AwsS3Service } from './aws-s3/aws-s3.service';
import { ChatModule } from './chat/chat.module';
import { DatabaseModule } from './database/database.module';
import { SocketModule } from './socket/socket.module';
import { StripeModule } from './stripe/stripe.module';
import { UserModule } from './user/user.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    DatabaseModule,
    AuthModule,
    ChatModule,
    SocketModule,
    StripeModule,
  ],
  controllers: [],
  providers: [AppGateway, AwsS3Service],
})
export class AppModule {}
