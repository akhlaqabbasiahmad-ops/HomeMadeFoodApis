import { Injectable, Module } from '@nestjs/common';
import { InjectRepository, TypeOrmModule } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { UserController } from '../controllers/user.controller';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
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

@Module({
  imports: [TypeOrmModule.forFeature([UserEntity, AddressEntity])],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}