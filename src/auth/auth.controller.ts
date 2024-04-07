import {
  Body,
  Controller,
  Get,
  Post,
  Query,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RequestWhithUser } from 'src/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth-guard';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly userService: UserService,
  ) {}

  @Post('register')
  async register(@Body(ValidationPipe) createUserDto: CreateUserDto) {
    return this.authService.register(createUserDto);
  }

  @Post('login')
  async login(@Body(ValidationPipe) authUserDto: LoginDto) {
    return await this.authService.login(authUserDto);
  }

  @Post('reset-password')
  async resetPassword(@Body('email') email: string) {
    return this.authService.resetPassword({ email });
  }

  @Get('verify-reset-password-token')
  async verifyResetPassword(@Query('token') token: string) {
    return this.authService.verifyResetPassword({ token });
  }

  @Post('update-password')
  async updatePassword(@Body() resetUserPassword: ResetUserPasswordDto) {
    return this.authService.updatePassword(resetUserPassword);
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async authenticate(@Request() request: RequestWhithUser) {
    const response = await this.userService.getUser({
      userId: request.user.userId,
    });

    return response;
  }
}
