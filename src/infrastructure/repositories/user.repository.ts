import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Address, User } from '../../domain/entities/user.entity';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { UserEntity } from '../database/entities/user.entity';

@Injectable()
export class UserRepository implements IUserRepository {
  constructor(
    @InjectRepository(UserEntity)
    private readonly userRepository: Repository<UserEntity>,
  ) {}

  async findById(id: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });

    return userEntity ? this.toDomainEntity(userEntity) : null;
  }

  async findByEmail(email: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { email },
      relations: ['addresses'],
    });

    return userEntity ? this.toDomainEntity(userEntity) : null;
  }

  async findByPhone(phone: string): Promise<User | null> {
    const userEntity = await this.userRepository.findOne({
      where: { phone },
      relations: ['addresses'],
    });

    return userEntity ? this.toDomainEntity(userEntity) : null;
  }

  async create(user: User): Promise<User> {
    const userEntity = this.toEntity(user);
    const savedEntity = await this.userRepository.save(userEntity);
    return this.toDomainEntity(savedEntity);
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updates);
    const updatedEntity = await this.userRepository.findOne({
      where: { id },
      relations: ['addresses'],
    });
    
    if (!updatedEntity) {
      throw new Error('User not found');
    }

    return this.toDomainEntity(updatedEntity);
  }

  async delete(id: string): Promise<void> {
    await this.userRepository.delete(id);
  }

  async findAll(page: number, limit: number): Promise<{ users: User[], total: number }> {
    const [entities, total] = await this.userRepository.findAndCount({
      relations: ['addresses'],
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });

    const users = entities.map(entity => this.toDomainEntity(entity));
    return { users, total };
  }

  async existsByEmail(email: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { email } });
    return count > 0;
  }

  async existsByPhone(phone: string): Promise<boolean> {
    const count = await this.userRepository.count({ where: { phone } });
    return count > 0;
  }

  private toDomainEntity(userEntity: UserEntity): User {
    return new User(
      userEntity.id,
      userEntity.name,
      userEntity.email,
      userEntity.phone,
      userEntity.password,
      userEntity.avatar,
      userEntity.addresses ? userEntity.addresses.map(addr => new Address(
        addr.id,
        addr.title,
        addr.address,
        addr.latitude,
        addr.longitude,
        addr.isDefault,
        addr.userId,
        addr.createdAt,
      )) : [],
      userEntity.role || 'user',
      userEntity.isActive,
      userEntity.createdAt,
      userEntity.updatedAt,
    );
  }

  private toEntity(user: User): UserEntity {
    const entity = new UserEntity();
    if (user.id) entity.id = user.id;
    entity.name = user.name;
    entity.email = user.email;
    entity.phone = user.phone;
    if (user.password) entity.password = user.password;
    if (user.avatar) entity.avatar = user.avatar;
    entity.role = user.role || 'user';
    entity.isActive = user.isActive;
    if (user.createdAt) entity.createdAt = user.createdAt;
    if (user.updatedAt) entity.updatedAt = user.updatedAt;
    return entity;
  }
}