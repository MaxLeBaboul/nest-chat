import { IsNotEmpty, IsString } from 'class-validator';
import { AuthUser } from 'src/common';

export class LoginDto implements AuthUser {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export class CreateUserDto implements AuthUser {
  @IsString()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
