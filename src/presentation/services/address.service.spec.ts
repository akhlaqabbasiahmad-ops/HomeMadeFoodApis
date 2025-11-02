import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { AddressService } from './address.service';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { CreateAddressDto } from '../../application/dto/user.dto';

describe('AddressService', () => {
  let service: AddressService;
  let addressRepository: Repository<AddressEntity>;
  let userRepository: Repository<UserEntity>;

  const mockUser: Partial<UserEntity> = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    role: 'user',
    isActive: true,
  };

  const mockAddress: Partial<AddressEntity> = {
    id: 'address-123',
    title: 'Home',
    address: '123 Main St, City, State 12345',
    latitude: 40.7128,
    longitude: -74.0060,
    isDefault: true,
    userId: 'user-123',
    createdAt: new Date(),
  };

  const mockAddresses: Partial<AddressEntity>[] = [
    {
      id: 'address-1',
      title: 'Home',
      address: '123 Main St',
      latitude: 40.7128,
      longitude: -74.0060,
      isDefault: true,
      userId: 'user-123',
      createdAt: new Date('2024-01-01'),
    },
    {
      id: 'address-2',
      title: 'Work',
      address: '456 Office St',
      latitude: 40.7589,
      longitude: -73.9851,
      isDefault: false,
      userId: 'user-123',
      createdAt: new Date('2024-01-02'),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AddressService,
        {
          provide: getRepositoryToken(AddressEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<AddressService>(AddressService);
    addressRepository = module.get<Repository<AddressEntity>>(
      getRepositoryToken(AddressEntity),
    );
    userRepository = module.get<Repository<UserEntity>>(
      getRepositoryToken(UserEntity),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getUserAddresses', () => {
    it('should return all addresses for a user', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'find')
        .mockResolvedValue(mockAddresses as AddressEntity[]);

      const result = await service.getUserAddresses('user-123');

      expect(result).toEqual(mockAddresses);
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(addressRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(service.getUserAddresses('user-123')).rejects.toThrow(
        NotFoundException,
      );
      await expect(service.getUserAddresses('user-123')).rejects.toThrow(
        'User with ID user-123 not found',
      );
      expect(addressRepository.find).not.toHaveBeenCalled();
    });

    it('should return empty array when user has no addresses', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(addressRepository, 'find').mockResolvedValue([]);

      const result = await service.getUserAddresses('user-123');

      expect(result).toEqual([]);
    });

    it('should order addresses by default first, then by creation date', async () => {
      const unorderedAddresses = [
        { ...mockAddresses[1], isDefault: false },
        { ...mockAddresses[0], isDefault: true },
      ];

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'find')
        .mockResolvedValue(unorderedAddresses as AddressEntity[]);

      const result = await service.getUserAddresses('user-123');

      expect(addressRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    });
  });

  describe('createUserAddress', () => {
    const createAddressDto: CreateAddressDto = {
      title: 'New Home',
      address: '789 New St, City, State 54321',
      latitude: 40.7589,
      longitude: -73.9851,
      isDefault: false,
    };

    it('should create a new address for a user', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({
          ...createAddressDto,
          userId: 'user-123',
          isDefault: false,
        } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...createAddressDto,
        } as AddressEntity);

      const result = await service.createUserAddress('user-123', createAddressDto);

      expect(result).toMatchObject({
        ...createAddressDto,
        userId: 'user-123',
      });
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(addressRepository.create).toHaveBeenCalledWith({
        ...createAddressDto,
        userId: 'user-123',
        isDefault: false,
      });
      expect(addressRepository.save).toHaveBeenCalled();
    });

    it('should throw NotFoundException when user does not exist', async () => {
      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        service.createUserAddress('user-123', createAddressDto),
      ).rejects.toThrow(NotFoundException);
      await expect(
        service.createUserAddress('user-123', createAddressDto),
      ).rejects.toThrow('User with ID user-123 not found');
      expect(addressRepository.create).not.toHaveBeenCalled();
      expect(addressRepository.save).not.toHaveBeenCalled();
    });

    it('should set other addresses as non-default when creating default address', async () => {
      const defaultAddressDto = { ...createAddressDto, isDefault: true };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 1, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({
          ...defaultAddressDto,
          userId: 'user-123',
          isDefault: true,
        } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...defaultAddressDto,
        } as AddressEntity);

      await service.createUserAddress('user-123', defaultAddressDto);

      expect(addressRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isDefault: true },
        { isDefault: false },
      );
    });

    it('should not update other addresses when creating non-default address', async () => {
      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({
          ...createAddressDto,
          userId: 'user-123',
          isDefault: false,
        } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...createAddressDto,
        } as AddressEntity);

      await service.createUserAddress('user-123', createAddressDto);

      expect(addressRepository.update).not.toHaveBeenCalled();
    });

    it('should default isDefault to false if not provided', async () => {
      const addressDtoWithoutDefault = {
        title: 'New Home',
        address: '789 New St',
        latitude: 40.7589,
        longitude: -73.9851,
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({
          ...addressDtoWithoutDefault,
          userId: 'user-123',
          isDefault: false,
        } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...addressDtoWithoutDefault,
          isDefault: false,
        } as AddressEntity);

      await service.createUserAddress('user-123', addressDtoWithoutDefault as CreateAddressDto);

      expect(addressRepository.create).toHaveBeenCalledWith({
        ...addressDtoWithoutDefault,
        userId: 'user-123',
        isDefault: false,
      });
    });
  });

  describe('verifyAddressOwnership', () => {
    it('should return true when address belongs to user', async () => {
      jest
        .spyOn(addressRepository, 'findOne')
        .mockResolvedValue(mockAddress as AddressEntity);

      const result = await service.verifyAddressOwnership(
        'address-123',
        'user-123',
      );

      expect(result).toBe(true);
      expect(addressRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'address-123', userId: 'user-123' },
      });
    });

    it('should return false when address does not belong to user', async () => {
      jest.spyOn(addressRepository, 'findOne').mockResolvedValue(null);

      const result = await service.verifyAddressOwnership(
        'address-123',
        'user-456',
      );

      expect(result).toBe(false);
    });

    it('should return false when address does not exist', async () => {
      jest.spyOn(addressRepository, 'findOne').mockResolvedValue(null);

      const result = await service.verifyAddressOwnership(
        'non-existent',
        'user-123',
      );

      expect(result).toBe(false);
    });
  });
});



