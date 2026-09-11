import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';
import { UserDto } from 'src/common/dtos/user.dto';
import { UsersService } from 'src/users/users.service';
import { ChangePasswordDto } from './dtos/change-password.dto';
import { CreateUserDto } from './dtos/create-user.dto';
import { LoggedInDto } from './dtos/logged-in.dto';
import { LoginDto } from './dtos/login.dto';
import { PayloadDto } from './dtos/payload.dto';
import { ExistingUserException } from './exceptions/existing-user.exception';

const SALT_ROUNDS = 10;

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  private async getAuthenticatedUser(userId: number, plainTextPassword: string) {
    const user = await this.userService.findOneById(userId);
    if (!user) {
      throw new NotFoundException('The user does not exist');
    }

    const isValid = await bcrypt.compare(plainTextPassword, user.password);
    if (!isValid) {
      throw new UnauthorizedException('Incorrect password');
    }

    return user;
  }

  async register(userDto: CreateUserDto): Promise<BaseResponseDto<UserDto>> {
    const exists = await this.userService.findOneByEmail(userDto.email);
    if (exists) {
      throw new ExistingUserException();
    }

    const hashedPassword = await bcrypt.hash(userDto.password, SALT_ROUNDS);
    const newUser = await this.userService.create({
      email: userDto.email,
      name: userDto.name,
      password: hashedPassword,
    });

    return {
      status: 201,
      message: 'User registered successfully',
      data: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
      },
    };
  }

  async login(loginDto: LoginDto): Promise<BaseResponseDto<LoggedInDto>> {
    const user = await this.userService.findOneByEmail(loginDto.email);
    if (!user) {
      throw new NotFoundException('The user does not exist');
    }

    const validPass = await bcrypt.compare(loginDto.password, user.password);
    if (!validPass) {
      throw new UnauthorizedException('Incorrect password');
    }

    const payload: PayloadDto = {
      sub: user.id,
      email: user.email,
    };

    const token = await this.jwtService.signAsync(payload);

    return {
      status: 200,
      message: 'Logged in successfully',
      data: {
        token,
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
        },
      },
    };
  }

  async changePassword(userId: number, data: ChangePasswordDto): Promise<BaseResponseDto<null>> {
    const user = await this.getAuthenticatedUser(userId, data.currentPassword);

    const newHash = await bcrypt.hash(data.newPassword, SALT_ROUNDS);
    await this.userService.save({ ...user, password: newHash });

    return {
      status: 200,
      message: 'Password updated successfully',
    };
  }

  async verifyPassword(userId: number, password: string): Promise<BaseResponseDto<null>> {
    await this.getAuthenticatedUser(userId, password);

    return {
      status: 200,
      message: 'Password verified successfully',
    };
  }
}