import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Request,
  UseGuards,
} from '@nestjs/common';

import { RequestWhithUser } from 'src/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth-guard';
import { ChatService } from './chat.service';
import { CreateConversationDto } from './dto/create-conversation.dto';
import { SendChatDto } from './dto/send-chat.dto';

@Controller('chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}
  @UseGuards(JwtAuthGuard)
  @Post()
  async createConversation(
    @Body() createConversationDto: CreateConversationDto,
    @Request() request: RequestWhithUser,
  ) {
    return await this.chatService.createConversation({
      createConversationDto,
      userId: request.user.userId,
    });
  }
  @UseGuards(JwtAuthGuard)
  @Post(':conversationId')
  async sendChat(
    @Param('conversationId') conversationId: string,
    @Body() sendChatDto: SendChatDto,
    @Request() request: RequestWhithUser,
  ) {
    return await this.chatService.sendChat({
      sendChatDto,
      conversationId,
      senderId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async getConversations(@Request() request: RequestWhithUser) {
    return await this.chatService.getConversations({
      userId: request.user.userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get(':conversationId')
  async getConversation(
    @Param('conversationId') conversationId: string,
    @Request() request: RequestWhithUser,
  ) {
    return await this.chatService.getConversation({
      conversationId,
      userId: request.user.userId,
    });
  }
}
