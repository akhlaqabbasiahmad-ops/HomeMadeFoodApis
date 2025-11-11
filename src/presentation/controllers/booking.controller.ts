import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { BookingService } from '../services/booking.service';
import { CreateBookingDto, GetBookingsQueryDto } from '../../application/dto/booking.dto';
import { BookingEntity } from '../../infrastructure/database/entities/booking.entity';

@ApiTags('Bookings')
@Controller('bookings')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiOperation({
    summary: 'Create a new booking',
    description: 'Creates a new booking with customer information, date, time, and services',
  })
  @ApiResponse({
    status: 201,
    description: 'Booking created successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Ahmed Ali',
          phone: '+966501234567',
          date: '2024-12-25',
          time: '14:30',
          status: 'pending',
          notes: null,
          services: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              serviceId: 'service-123',
              serviceName: 'Classic Haircut',
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174002',
              serviceId: 'service-456',
              serviceName: 'Beard Trim',
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        message: 'Booking created successfully',
      },
    },
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Validation failed',
    schema: {
      example: {
        statusCode: 400,
        message: [
          'name should not be empty',
          'phone must be a valid phone number',
          'date must be a valid date string',
          'time should not be empty',
          'services must be an array',
        ],
        error: 'Bad Request',
      },
    },
  })
  async createBooking(@Body() createBookingDto: CreateBookingDto) {
    const booking = await this.bookingService.createBooking(createBookingDto);
    return {
      success: true,
      data: booking,
      message: 'Booking created successfully',
    };
  }

  @Get()
  @ApiOperation({
    summary: 'Get all bookings',
    description: 'Retrieves a paginated list of bookings with optional filters by date, phone, and status',
  })
  @ApiQuery({
    name: 'date',
    required: false,
    description: 'Filter by date (YYYY-MM-DD)',
    example: '2024-12-25',
  })
  @ApiQuery({
    name: 'phone',
    required: false,
    description: 'Filter by phone number',
    example: '+966501234567',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by status (pending, confirmed, completed, cancelled)',
    example: 'pending',
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Number of items per page',
    example: 10,
  })
  @ApiResponse({
    status: 200,
    description: 'Bookings retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          bookings: [
            {
              id: '123e4567-e89b-12d3-a456-426614174000',
              name: 'Ahmed Ali',
              phone: '+966501234567',
              date: '2024-12-25',
              time: '14:30',
              status: 'pending',
              notes: null,
              services: [
                {
                  id: '123e4567-e89b-12d3-a456-426614174001',
                  serviceId: 'service-123',
                  serviceName: 'Classic Haircut',
                  bookingId: '123e4567-e89b-12d3-a456-426614174000',
                  createdAt: '2024-01-15T10:30:00.000Z',
                },
                {
                  id: '123e4567-e89b-12d3-a456-426614174002',
                  serviceId: 'service-456',
                  serviceName: 'Beard Trim',
                  bookingId: '123e4567-e89b-12d3-a456-426614174000',
                  createdAt: '2024-01-15T10:30:00.000Z',
                },
              ],
              createdAt: '2024-01-15T10:30:00.000Z',
              updatedAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          total: 1,
          page: 1,
          totalPages: 1,
        },
        message: 'Bookings retrieved successfully',
      },
    },
  })
  async getBookings(@Query() query: GetBookingsQueryDto) {
    const result = await this.bookingService.getBookings(query);
    return {
      success: true,
      data: result,
      message: 'Bookings retrieved successfully',
    };
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get booking by ID',
    description: 'Retrieves a specific booking by its ID',
  })
  @ApiParam({
    name: 'id',
    description: 'Booking ID (UUID)',
    type: String,
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiResponse({
    status: 200,
    description: 'Booking retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Ahmed Ali',
          phone: '+966501234567',
          date: '2024-12-25',
          time: '14:30',
          status: 'pending',
          notes: null,
          services: [
            {
              id: '123e4567-e89b-12d3-a456-426614174001',
              serviceId: 'service-123',
              serviceName: 'Classic Haircut',
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
            {
              id: '123e4567-e89b-12d3-a456-426614174002',
              serviceId: 'service-456',
              serviceName: 'Beard Trim',
              bookingId: '123e4567-e89b-12d3-a456-426614174000',
              createdAt: '2024-01-15T10:30:00.000Z',
            },
          ],
          createdAt: '2024-01-15T10:30:00.000Z',
          updatedAt: '2024-01-15T10:30:00.000Z',
        },
        message: 'Booking retrieved successfully',
      },
    },
  })
  @ApiResponse({
    status: 404,
    description: 'Booking not found',
    schema: {
      example: {
        statusCode: 404,
        message: 'Booking with ID 123e4567-e89b-12d3-a456-426614174000 not found',
        error: 'Not Found',
      },
    },
  })
  async getBookingById(@Param('id') id: string) {
    const booking = await this.bookingService.getBookingById(id);
    return {
      success: true,
      data: booking,
      message: 'Booking retrieved successfully',
    };
  }
}

