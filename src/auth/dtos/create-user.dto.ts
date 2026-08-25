import { IsEmail, IsNotEmpty, Matches } from 'class-validator';

export class CreateUserDto{
  @IsNotEmpty()
  @Matches(/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u, {
    message: 'name must contain only letters and spaces',
  })
  name: string;

  @IsNotEmpty()
  @IsEmail()
  email: string;

  @IsNotEmpty()
  password: string;
}