import { IsNotEmpty } from "class-validator";
import { UserDto } from "src/common/dtos/user.dto";

export class LoggedInDto {
  @IsNotEmpty()
  token: string;

  @IsNotEmpty()
  user: UserDto;
}