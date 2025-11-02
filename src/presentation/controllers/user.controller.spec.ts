import { Test, TestingModule } from '@nestjs/testing';
import { ForbiddenException, NotFoundException } from '@nestjs/common';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UserController } from './user.controller';
import { UserService } from '../modules/user.module';
import { AddressService } from '../services/address.service';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { CreateAddressDto } from '../../application/dto/user.dto';

describe('UserController', () => {
  let controller: UserController;
  let addressService: AddressService;
  let userService: UserService;
  let addressRepository: Repository<AddressEntity>;
  let userRepository: Repository<UserEntity>;

  // Mock data
  const mockUser: Partial<UserEntity> = {
    id: 'user-123',
    email: 'test@example.com',
    name: 'Test User',
    phone: '+1234567890',
    role: 'user',
    isActive: true,
  };

  const mockAdminUser: Partial<UserEntity> = {
    id: 'admin-123',
    email: 'admin@example.com',
    name: 'Admin User',
    phone: '+0987654321',
    role: 'admin',
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
      createdAt: new Date(),
    },
    {
      id: 'address-2',
      title: 'Work',
      address: '456 Office St',
      latitude: 40.7589,
      longitude: -73.9851,
      isDefault: false,
      userId: 'user-123',
      createdAt: new Date(),
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        UserService,
        AddressService,
        {
          provide: getRepositoryToken(UserEntity),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            findAndCount: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(AddressEntity),
          useValue: {
            find: jest.fn(),
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
    addressService = module.get<AddressService>(AddressService);
    userService = module.get<UserService>(UserService);
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
    it('should return addresses for the authenticated user', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'find')
        .mockResolvedValue(mockAddresses as AddressEntity[]);

      const result = await controller.getUserAddresses('user-123', req as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddresses);
      expect(result.message).toBe('Addresses retrieved successfully');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
      expect(addressRepository.find).toHaveBeenCalledWith({
        where: { userId: 'user-123' },
        order: { isDefault: 'DESC', createdAt: 'DESC' },
      });
    });

    it('should allow admin to access any user addresses', async () => {
      const req = {
        user: { id: 'admin-123', role: 'admin' },
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'find')
        .mockResolvedValue(mockAddresses as AddressEntity[]);

      const result = await controller.getUserAddresses('user-123', req as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockAddresses);
    });

    it('should throw ForbiddenException when user tries to access another user addresses', async () => {
      const req = {
        user: { id: 'user-456', role: 'user' },
      };

      await expect(
        controller.getUserAddresses('user-123', req as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.getUserAddresses('user-123', req as any),
      ).rejects.toThrow('You can only access your own addresses');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        controller.getUserAddresses('user-123', req as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should return empty array when user has no addresses', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest.spyOn(addressRepository, 'find').mockResolvedValue([]);

      const result = await controller.getUserAddresses('user-123', req as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual([]);
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

    it('should create address for the authenticated user', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({ ...createAddressDto, userId: 'user-123' } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...createAddressDto,
        } as AddressEntity);

      const result = await controller.createUserAddress(
        'user-123',
        createAddressDto,
        req as any,
      );

      expect(result.success).toBe(true);
      expect(result.data).toMatchObject({
        ...createAddressDto,
        userId: 'user-123',
      });
      expect(result.message).toBe('Address created successfully');
      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'user-123' },
      });
    });

    it('should allow admin to create address for any user', async () => {
      const req = {
        user: { id: 'admin-123', role: 'admin' },
      };

      jest
        .spyOn(userRepository, 'findOne')
        .mockResolvedValue(mockUser as UserEntity);
      jest
        .spyOn(addressRepository, 'update')
        .mockResolvedValue({ affected: 0, generatedMaps: [], raw: [] });
      jest
        .spyOn(addressRepository, 'create')
        .mockReturnValue({ ...createAddressDto, userId: 'user-123' } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...createAddressDto,
        } as AddressEntity);

      const result = await controller.createUserAddress(
        'user-123',
        createAddressDto,
        req as any,
      );

      expect(result.success).toBe(true);
    });

    it('should throw ForbiddenException when user tries to create address for another user', async () => {
      const req = {
        user: { id: 'user-456', role: 'user' },
      };

      await expect(
        controller.createUserAddress('user-123', createAddressDto, req as any),
      ).rejects.toThrow(ForbiddenException);
      await expect(
        controller.createUserAddress('user-123', createAddressDto, req as any),
      ).rejects.toThrow('You can only create addresses for yourself');
    });

    it('should throw NotFoundException when user does not exist', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

      jest.spyOn(userRepository, 'findOne').mockResolvedValue(null);

      await expect(
        controller.createUserAddress('user-123', createAddressDto, req as any),
      ).rejects.toThrow(NotFoundException);
    });

    it('should set other addresses as non-default when creating default address', async () => {
      const req = {
        user: { id: 'user-123', role: 'user' },
      };

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
        } as any);
      jest
        .spyOn(addressRepository, 'save')
        .mockResolvedValue({
          ...mockAddress,
          ...defaultAddressDto,
        } as AddressEntity);

      await controller.createUserAddress('user-123', defaultAddressDto, req as any);

      expect(addressRepository.update).toHaveBeenCalledWith(
        { userId: 'user-123', isDefault: true },
        { isDefault: false },
      );
    });
  });
});



