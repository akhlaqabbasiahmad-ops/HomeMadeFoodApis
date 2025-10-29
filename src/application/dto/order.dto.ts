import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsString, Min } from 'class-validator';
import { OrderStatus } from '../../domain/entities/order.entity';

export class CreateOrderItemDto {
  @ApiProperty({ example: 'food-item-id-123', description: 'Food item ID' })
  @IsNotEmpty()
  @IsString()
  foodItemId: string;

  @ApiProperty({ example: 2, description: 'Quantity of the item' })
  @IsNumber()
  @Min(1)
  quantity: number;

  @ApiProperty({ example: 'Extra cheese', description: 'Special instructions for this item', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class CreateOrderAddressDto {
  @ApiProperty({ example: 'Home', description: 'Address title' })
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty({ example: '123 Main St, City, State 12345', description: 'Full address' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: 40.7128, description: 'Latitude coordinate' })
  @IsNumber()
  latitude: number;

  @ApiProperty({ example: -74.0060, description: 'Longitude coordinate' })
  @IsNumber()
  longitude: number;
}

export class CreateOrderDto {
  @ApiProperty({ example: 'restaurant-id-123', description: 'Restaurant ID' })
  @IsNotEmpty()
  @IsString()
  restaurantId: string;

  @ApiProperty({ 
    type: [CreateOrderItemDto], 
    description: 'List of order items',
    example: [{ foodItemId: 'food-1', quantity: 2, specialInstructions: 'Extra cheese' }]
  })
  @IsArray()
  items: CreateOrderItemDto[];

  @ApiProperty({ 
    type: CreateOrderAddressDto, 
    description: 'Delivery address' 
  })
  deliveryAddress: CreateOrderAddressDto;

  @ApiProperty({ example: 'credit_card', description: 'Payment method' })
  @IsNotEmpty()
  @IsString()
  paymentMethod: string;

  @ApiProperty({ example: 'No spicy food', description: 'Special instructions for the order', required: false })
  @IsOptional()
  @IsString()
  specialInstructions?: string;
}

export class UpdateOrderStatusDto {
  @ApiProperty({ 
    example: OrderStatus.CONFIRMED, 
    description: 'New order status',
    enum: OrderStatus
  })
  @IsEnum(OrderStatus)
  status: OrderStatus;
}

export class GetOrdersQueryDto {
  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, description: 'Items per page', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  limit?: number;

  @ApiProperty({ 
    example: OrderStatus.PENDING, 
    description: 'Filter by order status', 
    required: false,
    enum: OrderStatus
  })
  @IsOptional()
  @IsEnum(OrderStatus)
  status?: OrderStatus;
}