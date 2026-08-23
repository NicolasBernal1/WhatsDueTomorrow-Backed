import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UserDto } from 'src/common/dtos/user.dto';
import { UsersService } from 'src/users/users.service';
import { ExistingUserException } from './exceptions/existing-user.exception';
import * as bcrypt from 'bcrypt';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoginDto } from './dtos/login.dto';
import { PayloadDto } from './dtos/payload.dto';
import { LoggedInDto } from './dtos/logged-in.dto';
import { ChangePasswordDto } from './dtos/change-password.dto';

@Injectable()
export class AuthService {
  constructor(private userService: UsersService, private jwtService: JwtService){}

  async register(userDto: CreateUserDto): Promise<BaseResponseDto<UserDto>>{
    const exists = await this.userService.findOneByEmail(userDto.email);
    if(exists){
      throw new ExistingUserException();
    }

    const salt_rounds = 10;
    const hashed_password = await bcrypt.hash(userDto.password, salt_rounds);
    const new_user = await this.userService.create({ 
      email: userDto.email, name: userDto.name, password: hashed_password });

    return {
      status: 201,
      message: "Usuar registered successfully",
      data: {
        id: new_user.id,
        name: new_user.name,
        email: new_user.email
      }
    }
  }

  async login(loginDto: LoginDto): Promise<BaseResponseDto<LoggedInDto>>{
    const user = await this.userService.findOneByEmail(loginDto.email);
    if(!user){
      throw new NotFoundException('The user does not exist');
    }

    const validPass = await bcrypt.compare(loginDto.password, user.password);
    if(!validPass){
      throw new UnauthorizedException('Incorrect password');
    }

    const payload: PayloadDto = {
      sub: user.id,
      email: user.email
    }

    const token = await this.jwtService.signAsync(payload);

    return{
      status: 200,
      message: "Logged in successfully",
      data: {
        token: token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email
        }
      }
    }
  }

  async changePassword(userId: number, changePasswordDto: ChangePasswordDto): Promise<BaseResponseDto<null>> {
    const user = await this.userService.findOneById(userId);

    if(!user) {
      throw new NotFoundException('The user does not exist');
    }

    const validPassword = await bcrypt.compare(changePasswordDto.currentPassword, user.password);

    if(!validPassword) {
      throw new UnauthorizedException('Incorrect current password');
    }

    const salt_rounds = 10;
    const hashed_password = await bcrypt.hash(changePasswordDto.newPassword, salt_rounds);

    user.password = hashed_password;

    await this.userService.save(user);

    return {
      status: 200,
      message: 'Password updated successfully'
    }
  }

  async verifyPassword(userId: number, password: string): Promise<BaseResponseDto<null>> {
    const user = await this.userService.findOneById(userId);

    if (!user) {
      throw new NotFoundException('The user does not exist');
    }

    const validPassword = await bcrypt.compare(password, user.password);

    if (!validPassword) {
      throw new UnauthorizedException('Incorrect password');
    }

    return {
      status: 200,
      message: 'Password verified successfully'
    };
  }
}
