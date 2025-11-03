import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async createUser(userData: any) {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async getAllUsers(page: number = 1, limit: number = 10) {
    const [users, total] = await this.userRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
    });
    return { users, total, page, totalPages: Math.ceil(total / limit) };
  }

  async findUserById(id: string) {
    return await this.userRepository.findOne({ where: { id } });
  }

  async updateUser(id: string, updateData: any) {
    await this.userRepository.update(id, updateData);
    return await this.userRepository.findOne({ where: { id } });
  }

  async deleteUser(id: string) {
    const result = await this.userRepository.delete(id);
    return result.affected > 0;
  }
}

