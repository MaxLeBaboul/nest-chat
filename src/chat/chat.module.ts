import { Module } from '@nestjs/common';
import { AwsS3Service } from 'src/aws-s3/aws-s3.service';
import { DatabaseService } from 'src/database/database.service';
import { ChatController } from './chat.controller';
import { ChatService } from './chat.service';

@Module({
  controllers: [ChatController],
  providers: [ChatService, DatabaseService, AwsS3Service],
})
export class ChatModule {}
