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
    ApiQuery,
    ApiResponse,
    ApiTags,
} from '@nestjs/swagger';
import { CreateAddressDto, CreateUserDto, UpdateUserDto } from '../../application/dto/user.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { UserService } from '../modules/user.module';
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
  @ApiOperation({ summary: 'Get all addresses for a user' })
  @ApiResponse({ status: 200, description: 'Addresses retrieved successfully' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot access other users addresses' })
  @ApiResponse({ status: 404, description: 'User not found' })
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
  @ApiOperation({ summary: 'Create a new address for a user' })
  @ApiResponse({ status: 201, description: 'Address created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 403, description: 'Forbidden - Cannot create addresses for other users' })
  @ApiResponse({ status: 404, description: 'User not found' })
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