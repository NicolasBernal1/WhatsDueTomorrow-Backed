import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto } from 'src/auth/dtos/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>
  ){}

  async findOneByEmail(email: string): Promise<User | null>{
    return await this.userRepository.findOneBy({ email });
  }

  async create(createUserDto: CreateUserDto): Promise<User>{
   const new_user = this.userRepository.create(createUserDto);
   return await this.userRepository.save(new_user);
  }
}
