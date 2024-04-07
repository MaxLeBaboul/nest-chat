import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { createId } from '@paralleldrive/cuid2';
import { compare, hash } from 'bcrypt';
import { AuthPayload } from 'src/common';
import { DatabaseService } from 'src/database/database.service';
import { MailerService } from 'src/mailer.service';
import { CreateUserDto, LoginDto } from './dto/auth.dto';
import { ResetUserPasswordDto } from './dto/reset-user-password.dto';

@Injectable()
export class AuthService {
  constructor(
    private readonly databaseService: DatabaseService,
    private readonly jwtService: JwtService,
    private readonly mailerService: MailerService,
  ) {}

  async register(authUserDto: CreateUserDto) {
    try {
      const { email, firstName, password } = authUserDto;

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

      await this.mailerService.sendCreateAccountEmail({
        firstName,
        recipient: email,
      });

      return await this.getAuthenticateUser({ userId: createdUser.id });
    } catch (error) {
      return { error: true, message: error.message };
    }
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
    }

    const ispasswordCorrect = await this.isPasswordValid({
      password,
      hashedPassword: existingUser.password,
    });

    if (!ispasswordCorrect) {
      throw new Error('Invalid password');
    }
    return await this.getAuthenticateUser({ userId: existingUser.id });
  }

  private async hashPassword(password: string) {
    const hashedPassword = await hash(password, 10);
    return hashedPassword;
  }

  private async isPasswordValid({
    password,
    hashedPassword,
  }: {
    password: string;
    hashedPassword: string;
  }) {
    const isPasswordValid = await compare(password, hashedPassword);
    return isPasswordValid;
  }

  private async getAuthenticateUser({ userId }: AuthPayload) {
    const payload: AuthPayload = { userId };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }

  async resetPassword({ email }: { email: string }) {
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: {
          email,
        },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      if (existingUser.isResettingPassword === true) {
        throw new Error('User Password has already been reset');
      }

      const createdId = createId();
      await this.databaseService.user.update({
        where: {
          email,
        },
        data: {
          isResettingPassword: true,
          resetPasswordToken: createdId,
        },
      });

      await this.mailerService.sendResetPasswordEmail({
        firstName: existingUser.firstName,
        recipient: existingUser.email,
        token: createdId,
      });

      return {
        error: true,
        message: 'Password reset link has been sent to your email',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async verifyResetPassword({ token }: { token: string }) {
    try {
      const existingUser = await this.databaseService.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      if (existingUser.isResettingPassword === false) {
        throw new Error('User Password resetting is not initialized');
      }

      return {
        error: true,
        message: 'Token is Available and will be used in the next',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }

  async updatePassword(resetUserPasswordDto: ResetUserPasswordDto) {
    try {
      const { password, token } = resetUserPasswordDto;
      const existingUser = await this.databaseService.user.findUnique({
        where: {
          resetPasswordToken: token,
        },
      });

      if (!existingUser) {
        throw new Error('User not found');
      }

      if (existingUser.isResettingPassword === false) {
        throw new Error('User Password resetting is not initialized');
      }

      const hashPassword = await this.hashPassword(password);

      await this.databaseService.user.update({
        where: {
          resetPasswordToken: token,
        },
        data: {
          isResettingPassword: false,
          password: hashPassword,
        },
      });

      return {
        error: true,
        message: 'Your Password has already been changed',
      };
    } catch (error) {
      return { error: true, message: error.message };
    }
  }
}
