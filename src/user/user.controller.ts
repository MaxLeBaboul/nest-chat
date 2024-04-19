import {
  Controller,
  Get,
  Param,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';

import { RequestWhithUser } from 'src/common';
import { fileSchema } from 'src/file-utils';
import { JwtAuthGuard } from 'src/guard/jwt-auth-guard';
import { UserService } from './user.service';

@Controller('users')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get()
  // localhost:3000/users
  getUsers() {
    return this.userService.getUsers();
  }

  @Get('/:userId')
  // localhost:3000/users/3000
  getUser(@Param('userId') userId: string) {
    return this.userService.getUser({
      userId,
    });
  }

  @UseGuards(JwtAuthGuard)
  @UseInterceptors(FileInterceptor('avatar'))
  @Post()
  async updateUser(
    @Req() requestWithUser: RequestWhithUser,
    @UploadedFile() file,
  ) {
    console.log({ file });
    const submittedFile = fileSchema.parse(file);
    return this.userService.updateUser({
      userId: requestWithUser.user.userId,
      submittedFile,
    });
  }
}
