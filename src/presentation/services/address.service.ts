import { Injectable, ForbiddenException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { CreateAddressDto } from '../../application/dto/user.dto';

@Injectable()
export class AddressService {
  constructor(
    @InjectRepository(AddressEntity)
    private addressRepository: Repository<AddressEntity>,
    @InjectRepository(UserEntity)
    private userRepository: Repository<UserEntity>,
  ) {}

  async getUserAddresses(userId: string): Promise<AddressEntity[]> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // Get all addresses for the user, ordered by default first, then by creation date
    const addresses = await this.addressRepository.find({
      where: { userId },
      order: { isDefault: 'DESC', createdAt: 'DESC' },
    });

    return addresses;
  }

  async createUserAddress(userId: string, createAddressDto: CreateAddressDto): Promise<AddressEntity> {
    // Verify user exists
    const user = await this.userRepository.findOne({ where: { id: userId } });
    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    // If this address is set as default, remove default flag from other addresses
    if (createAddressDto.isDefault === true) {
      await this.addressRepository.update(
        { userId, isDefault: true },
        { isDefault: false }
      );
    }

    // Create new address
    const address = this.addressRepository.create({
      ...createAddressDto,
      userId,
      isDefault: createAddressDto.isDefault ?? false,
    });

    return await this.addressRepository.save(address);
  }

  async verifyAddressOwnership(addressId: string, userId: string): Promise<boolean> {
    const address = await this.addressRepository.findOne({
      where: { id: addressId, userId },
    });
    return !!address;
  }
}

