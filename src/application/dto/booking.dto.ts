import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDateString, IsEnum, IsNotEmpty, IsOptional, IsPhoneNumber, IsString, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { BookingStatus } from '../../infrastructure/database/entities/booking.entity';

export class BookingServiceDto {
  @ApiProperty({ example: 'service-123', description: 'Service ID' })
  @IsNotEmpty()
  @IsString()
  serviceId: string;

  @ApiProperty({ example: 'Classic Haircut', description: 'Service name' })
  @IsNotEmpty()
  @IsString()
  serviceName: string;
}

export class CreateBookingDto {
  @ApiProperty({ example: 'Ahmed Ali', description: 'Customer name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: '+966501234567', description: 'Customer phone number' })
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string;

  @ApiProperty({ example: '2024-12-25', description: 'Booking date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  date: string;

  @ApiProperty({ example: '14:30', description: 'Booking time (HH:mm)' })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({
    example: [
      { serviceId: 'service-123', serviceName: 'Classic Haircut' },
      { serviceId: 'service-456', serviceName: 'Beard Trim' },
    ],
    description: 'List of services to book',
    type: [BookingServiceDto],
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingServiceDto)
  services: BookingServiceDto[];

  @ApiProperty({ example: 'Please arrive 10 minutes early', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;
}

export class GetBookingsQueryDto {
  @ApiProperty({ example: '2024-12-25', description: 'Filter by date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: '+966501234567', description: 'Filter by phone number', required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ example: 'pending', description: 'Filter by status (pending, confirmed, completed, cancelled)', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  page?: number;

  @ApiProperty({ example: 10, description: 'Number of items per page', required: false })
  @IsOptional()
  limit?: number;
}

export class UpdateBookingStatusDto {
  @ApiProperty({
    example: 'confirmed',
    description: 'New status for the booking',
    enum: BookingStatus,
    enumName: 'BookingStatus',
  })
  @IsNotEmpty()
  @IsEnum(BookingStatus, {
    message: 'Status must be one of: pending, confirmed, completed, cancelled',
  })
  status: BookingStatus;
}

export class UpdateBookingDto {
  @ApiProperty({ example: 'Ahmed Ali', description: 'Customer name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: '+966501234567', description: 'Customer phone number', required: false })
  @IsOptional()
  @IsPhoneNumber()
  phone?: string;

  @ApiProperty({ example: '2024-12-25', description: 'Booking date (YYYY-MM-DD)', required: false })
  @IsOptional()
  @IsDateString()
  date?: string;

  @ApiProperty({ example: '14:30', description: 'Booking time (HH:mm)', required: false })
  @IsOptional()
  @IsString()
  time?: string;

  @ApiProperty({
    example: [
      { serviceId: 'service-123', serviceName: 'Classic Haircut' },
      { serviceId: 'service-456', serviceName: 'Beard Trim' },
    ],
    description: 'List of services to book',
    type: [BookingServiceDto],
    required: false,
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BookingServiceDto)
  services?: BookingServiceDto[];

  @ApiProperty({ example: 'Please arrive 10 minutes early', description: 'Additional notes', required: false })
  @IsOptional()
  @IsString()
  notes?: string;

  @ApiProperty({
    example: 'confirmed',
    description: 'Booking status',
    enum: BookingStatus,
    enumName: 'BookingStatus',
    required: false,
  })
  @IsOptional()
  @IsEnum(BookingStatus, {
    message: 'Status must be one of: pending, confirmed, completed, cancelled',
  })
  status?: BookingStatus;
}

