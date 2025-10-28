import { Body, Controller, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dtos/create-user.dto';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { UserDto } from 'src/common/dtos/user.dto';
import { LoggedInDto } from './dtos/logged-in.dto';
import { LoginDto } from './dtos/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService){}

  @Post('register')
  async register(@Body() userDto: CreateUserDto): Promise<BaseResponseDto<UserDto>>{
    return await this.authService.register(userDto);
  }

  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<BaseResponseDto<LoggedInDto>>{
    return await this.authService.login(loginDto);
  }
}
