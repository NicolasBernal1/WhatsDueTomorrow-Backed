import { Controller, Delete, Get, Request, UseGuards } from '@nestjs/common';
import { UsersService } from './users.service';
import { AuthGuard } from '@nestjs/passport';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { UserDto } from 'src/common/dtos/user.dto';

@UseGuards(AuthGuard('jwt'))
@Controller('users')
export class UsersController {
  constructor(private readonly userService: UsersService){}

  @Get('profile')
  async profile(@Request() req): Promise<BaseResponseDto<UserDto>>{
    return await this.userService.getProfile(req.user.email);
  }

  @Delete('profile')
  async deleteAccount(@Request() req):Promise<BaseResponseDto<null>>{
    return await this.userService.remove(req.user.sub);
  }
}
