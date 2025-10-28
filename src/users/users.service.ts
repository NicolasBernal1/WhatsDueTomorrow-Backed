import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';
import { UserDto } from 'src/common/dtos/user.dto';
import { BaseResponseDto } from 'src/common/dtos/base-response.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  async findOneByEmail(email: string): Promise<User | null>{
    return await this.userRepository.findOneBy({ email });
  }

  async findOneById(id: number): Promise<User | null>{
    return await this.userRepository.findOneBy({ id });
  }

  async create(createUserDto: CreateUserDto): Promise<User>{
   const new_user = this.userRepository.create(createUserDto);
   return await this.userRepository.save(new_user);
  }

  async getProfile(email: string): Promise<BaseResponseDto<UserDto>>{
    const user = await this.findOneByEmail(email);
    if(!user){
      throw new NotFoundException("The user does not exist")
    }
    return {
      status: 200,
      message: "User profile retrieved successfully",
      data: {
        id: user.id,
        name: user.name,
        email: user.email
      }
    }
  }

  async remove(id: number):Promise<BaseResponseDto<null>>{
    const user = await this.userRepository.findOneBy({ id: id });
    if(!user){
      throw new NotFoundException("The user does not exist");
    }

    await this.userRepository.delete(id);

    return {
      status: 204,
      message: "User deleted successfully"
    }
  }
}
