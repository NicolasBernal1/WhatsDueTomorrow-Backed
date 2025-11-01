import { IsNotEmpty, IsOptional } from "class-validator";

export class UserDto{
  @IsOptional()
  id?: number;

  @IsOptional()
  name?: string;

  @IsNotEmpty()
  email: string;

  @IsOptional()
  password?: string;
}