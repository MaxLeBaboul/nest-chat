import { Module } from '@nestjs/common';

import { ConfigModule } from '@nestjs/config';
import { AppGateway } from './app.gateway';
import { AuthModule } from './auth/auth.module';
import { DatabaseModule } from './database/database.module';
import { UserModule } from './user/user.module';
import { ChatModule } from './chat/chat.module';
import { SocketModule } from './socket/socket.module';
import { AwsS3Service } from './aws-s3/aws-s3.service';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    UserModule,
    DatabaseModule,
    AuthModule,
    ChatModule,
    SocketModule,
  ],
  controllers: [],
  providers: [AppGateway, AwsS3Service],
})
export class AppModule {}
