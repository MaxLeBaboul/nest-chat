import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';
import { AuthUser } from 'src/common';

export class LoginDto implements AuthUser {
  @IsEmail(
    {},
    {
      message: 'Email is not valid',
    },
  )
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}

export class CreateUserDto implements AuthUser {
  @IsEmail(
    {},
    {
      message: 'Email is not valid',
    },
  )
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName?: string;

  @IsString()
  @IsNotEmpty()
  @MinLength(6, { message: 'Password must be at least 6 characters long' })
  password: string;
}
