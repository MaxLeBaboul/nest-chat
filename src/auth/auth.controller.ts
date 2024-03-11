import {
  Body,
  Controller,
  Get,
  Post,
  Request,
  UseGuards,
  ValidationPipe,
} from '@nestjs/common';
import { RequestWhithUser } from 'src/common';
import { JwtAuthGuard } from 'src/guard/jwt-auth-guard';
import { UserService } from 'src/user/user.service';
import { AuthService } from './auth.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

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
    console.log(authUserDto);

    return await this.authService.login(authUserDto);
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
