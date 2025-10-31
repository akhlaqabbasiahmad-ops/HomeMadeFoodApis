import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString, MinLength } from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number' })
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: 'password123', description: 'User password', minLength: 1 })
  @IsNotEmpty()
  @IsString()
  @MinLength(1)
  password: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class UpdateUserDto {
  @ApiProperty({ example: 'John Doe', description: 'User full name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+1234567890', description: 'User phone number', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: 'https://example.com/avatar.jpg', description: 'User avatar URL', required: false })
  @IsOptional()
  @IsString()
  avatar?: string;
}

export class LoginDto {
  @ApiProperty({ example: 'john.doe@example.com', description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ example: 'password123', description: 'User password' })
  @IsNotEmpty()
  @IsString()
  password: string;
}

export class CreateAddressDto {
  @ApiProperty({ example: 'Home', description: 'Address title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '123 Main St, City, State 12345', description: 'Full address' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNotEmpty()
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNotEmpty()
  @IsNumber()
  longitude: number;

  @ApiProperty({ example: true, description: 'Set as default address', required: false })
  @IsOptional()
  isDefault?: boolean;
}