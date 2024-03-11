import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { compare, hash } from 'bcrypt';
import { AuthPayload } from 'src/common';
import { DatabaseService } from 'src/database/database.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
  ) {}

  async register(authUserDto: CreateUserDto) {
    const { email, firstName, password } = authUserDto;

    // console.log({ hashPassword, password });

    const existingUser = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
    if (existingUser) {
      throw new Error('This User already have Account');
      return;
    }
    const hashPassword = await this.hashPassword(password);

    const createdUser = await this.databaseService.user.create({
      data: {
        email,
        firstName,
        password: hashPassword,
      },
    });

    return await this.getAuthenticateUser({ userId: createdUser.id });
  }

  async login(authUserDto: LoginDto) {
    const { email, password } = authUserDto;

    //const hashPassword = await this.hashPassword(password);
    // console.log({ hashPassword, password });

    const existingUser = await this.databaseService.user.findUnique({
      where: {
        email,
      },
    });
    if (!existingUser) {
      throw new Error('User not found');
      return;
    }

    const ispasswordCorrect = await compare(password, existingUser.password);

    if (!ispasswordCorrect) {
      throw new Error('Invalid password');
      return;
    }
    return await this.getAuthenticateUser({ userId: existingUser.id });
  }

  private async hashPassword(password: string) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  private async isPasswordValid(password: string, hashedPassword: string) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }

  private async getAuthenticateUser({ userId }: AuthPayload) {
    const payload: AuthPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
