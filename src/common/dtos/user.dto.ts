import { IsNotEmpty, IsOptional } from "class-validator";

export class UserDto{
  @IsOptional()
  id: number;

  @IsNotEmpty()
  name: string;

  @IsNotEmpty()
  email: string;

  @IsOptional()
  password?: string;
}