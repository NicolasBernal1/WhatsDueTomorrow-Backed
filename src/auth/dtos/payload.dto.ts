import { IsNotEmpty } from "class-validator";

export class PayloadDto {
  @IsNotEmpty()
  readonly sub: number;

  @IsNotEmpty()
  readonly email: string;
}