import {
    Body,
    Controller,
    Delete,
    ForbiddenException,
    Get,
    Param,
    Patch,
    Post,
    Query,
    Request,
    UseGuards,
} from '@nestjs/common';
import {
    ApiBearerAuth,
    ApiOperation,
    ApiParam,
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateAddressDto, CreateUserDto, UpdateUserDto } from '../../application/dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../services/user.service';
import { AddressService } from '../services/address.service';

@ApiTags('users')
@Controller('users')
export class UserController {
  constructor(
    private readonly userService: UserService,
    private readonly addressService: AddressService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 409, description: 'User already exists' })
  async create(@Body() createUserDto: CreateUserDto) {
    const user = await this.userService.createUser(createUserDto);
    // Remove password from response
    const { password, ...userWithoutPassword } = user as any;
    return {
      success: true,
      data: userWithoutPassword,
      message: 'User created successfully',
    };
  }

  @Get()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get all users (admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  async findAll(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.userService.getAllUsers(page, limit);
    return {
      success: true,
      data: result,
      message: 'Users retrieved successfully',
    };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get current user profile' })
  @ApiResponse({ status: 200, description: 'Profile retrieved successfully' })
  async getProfile(@Request() req) {
    const user = await this.userService.findUserById(req.user.id);
    const { password, ...userWithoutPassword } = user as any;
    return {
      success: true,
      data: userWithoutPassword,
      message: 'Profile retrieved successfully',
    };
  }

  // Address routes must come before generic :id route to avoid route conflicts
  @Get(':id/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Get all addresses for a user',
    description: 'Retrieves all addresses associated with a user. Addresses are ordered by default address first, then by creation date. Users can only access their own addresses unless they are an admin.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (UUID)',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Addresses retrieved successfully',
    schema: {
      example: {
        success: true,
        data: [
          {
            id: '123e4567-e89b-12d3-a456-426614174001',
            title: 'Home',
            address: '123 Main Street, Karachi, Pakistan',
            latitude: 24.8607,
            longitude: 67.0011,
            isDefault: true,
            userId: '123e4567-e89b-12d3-a456-426614174000',
            createdAt: '2024-01-15T10:30:00.000Z'
          },
          {
            id: '123e4567-e89b-12d3-a456-426614174002',
            title: 'Office',
            address: '456 Business Avenue, Karachi, Pakistan',
            latitude: 24.8610,
            longitude: 67.0015,
            isDefault: false,
            userId: '123e4567-e89b-12d3-a456-426614174000',
            createdAt: '2024-01-20T14:20:00.000Z'
          }
        ],
        message: 'Addresses retrieved successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Cannot access other users addresses',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only access your own addresses',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized'
      }
    }
  })
  async getUserAddresses(@Param('id') userId: string, @Request() req) {
    // Security check: Users can only access their own addresses (unless admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only access your own addresses');
    }

    const addresses = await this.addressService.getUserAddresses(userId);
    return {
      success: true,
      data: addresses,
      message: 'Addresses retrieved successfully',
    };
  }

  @Post(':id/addresses')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ 
    summary: 'Create a new address for a user',
    description: 'Creates a new address for the specified user. If isDefault is set to true, all other addresses for this user will have their isDefault flag set to false. Users can only create addresses for themselves unless they are an admin.'
  })
  @ApiParam({ 
    name: 'id', 
    description: 'User ID (UUID)',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  @ApiResponse({ 
    status: 201, 
    description: 'Address created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174001',
          title: 'Home',
          address: '123 Main Street, Karachi, Pakistan',
          latitude: 24.8607,
          longitude: 67.0011,
          isDefault: true,
          userId: '123e4567-e89b-12d3-a456-426614174000',
          createdAt: '2024-01-15T10:30:00.000Z'
        },
        message: 'Address created successfully'
      }
    }
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'title should not be empty',
          'address should not be empty',
          'latitude must be a number',
          'longitude must be a number'
        ],
        error: 'Bad Request'
      }
    }
  })
  @ApiResponse({ 
    status: 403, 
    description: 'Forbidden - Cannot create addresses for other users',
    schema: {
      example: {
        statusCode: 403,
        message: 'You can only create addresses for yourself',
        error: 'Forbidden'
      }
    }
  })
  @ApiResponse({ 
    status: 404, 
    description: 'User not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'User with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found'
      }
    }
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized - Invalid or missing JWT token',
    schema: {
      example: {
        statusCode: 401,
        message: 'Unauthorized'
      }
    }
  })
  async createUserAddress(
    @Param('id') userId: string,
    @Body() createAddressDto: CreateAddressDto,
    @Request() req,
  ) {
    // Security check: Users can only create addresses for themselves (unless admin)
    if (req.user.id !== userId && req.user.role !== 'admin') {
      throw new ForbiddenException('You can only create addresses for yourself');
    }

    const address = await this.addressService.createUserAddress(userId, createAddressDto);
    return {
      success: true,
      data: address,
      message: 'Address created successfully',
    };
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiResponse({ status: 200, description: 'User found' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async findOne(@Param('id') id: string) {
    const user = await this.userService.findUserById(id);
    const { password, ...userWithoutPassword } = user as any;
    return {
      success: true,
      data: userWithoutPassword,
      message: 'User retrieved successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update user' })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async update(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    const user = await this.userService.updateUser(id, updateUserDto);
    const { password, ...userWithoutPassword } = user as any;
    return {
      success: true,
      data: userWithoutPassword,
      message: 'User updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete user' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  async remove(@Param('id') id: string) {
    await this.userService.deleteUser(id);
    return {
      success: true,
      message: 'User deleted successfully',
    };
  }
}