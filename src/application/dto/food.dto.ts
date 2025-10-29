import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsNotEmpty, IsNumber, IsOptional, IsString, Max, Min } from 'class-validator';

export class CreateFoodItemDto {
  @ApiProperty({ example: 'Margherita Pizza', description: 'Food item name' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({ example: 'Fresh tomatoes, mozzarella, and basil', description: 'Food item description' })
  @IsNotEmpty()
  @IsString()
  description: string;

  @ApiProperty({ example: 'https://example.com/pizza.jpg', description: 'Food item image URL' })
  @IsNotEmpty()
  @IsString()
  image: string;

  @ApiProperty({ example: 12.99, description: 'Food item price' })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({ example: 14.99, description: 'Original price before discount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: 'Pizza', description: 'Food category' })
  @IsNotEmpty()
  @IsString()
  category: string;

  @ApiProperty({ example: 'restaurant-123', description: 'Restaurant ID', required: false })
  @IsOptional()
  @IsString()
  restaurantId?: string;

  @ApiProperty({ example: 'Mama Mia Restaurant', description: 'Restaurant name', required: false })
  @IsOptional()
  @IsString()
  restaurantName?: string;

  @ApiProperty({ example: ['tomato', 'mozzarella', 'basil'], description: 'List of ingredients' })
  @IsArray()
  @IsString({ each: true })
  ingredients: string[];

  @ApiProperty({ example: ['dairy'], description: 'List of allergens', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ example: true, description: 'Is vegetarian friendly' })
  @IsBoolean()
  isVegetarian: boolean;

  @ApiProperty({ example: false, description: 'Is vegan friendly' })
  @IsBoolean()
  isVegan: boolean;

  @ApiProperty({ example: false, description: 'Is spicy' })
  @IsBoolean()
  isSpicy: boolean;

  @ApiProperty({ example: 20, description: 'Preparation time in minutes' })
  @IsNumber()
  @Min(1)
  preparationTime: number;

  @ApiProperty({ example: 280, description: 'Calories per serving', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({ example: true, description: 'Is featured item', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: true, description: 'Is popular item', required: false })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}

export class UpdateFoodItemDto {
  @ApiProperty({ example: 'Margherita Pizza', description: 'Food item name', required: false })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({ example: 'Fresh tomatoes, mozzarella, and basil', description: 'Food item description', required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: 'https://example.com/pizza.jpg', description: 'Food item image URL', required: false })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ example: 12.99, description: 'Food item price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  price?: number;

  @ApiProperty({ example: 14.99, description: 'Original price before discount', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  originalPrice?: number;

  @ApiProperty({ example: ['tomato', 'mozzarella', 'basil'], description: 'List of ingredients', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ingredients?: string[];

  @ApiProperty({ example: ['dairy'], description: 'List of allergens', required: false })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  allergens?: string[];

  @ApiProperty({ example: true, description: 'Is vegetarian friendly', required: false })
  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @ApiProperty({ example: false, description: 'Is vegan friendly', required: false })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;

  @ApiProperty({ example: false, description: 'Is spicy', required: false })
  @IsOptional()
  @IsBoolean()
  isSpicy?: boolean;

  @ApiProperty({ example: 20, description: 'Preparation time in minutes', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  preparationTime?: number;

  @ApiProperty({ example: 280, description: 'Calories per serving', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  calories?: number;

  @ApiProperty({ example: true, description: 'Is available for order', required: false })
  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;

  @ApiProperty({ example: true, description: 'Is featured item', required: false })
  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @ApiProperty({ example: true, description: 'Is popular item', required: false })
  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;
}

export class SearchFoodDto {
  @ApiProperty({ example: 'pizza', description: 'Search query', required: false })
  @IsOptional()
  @IsString()
  query?: string;

  @ApiProperty({ example: 'Pizza', description: 'Category filter', required: false })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 1, description: 'Page number', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  page?: number;

  @ApiProperty({ example: 10, description: 'Items per page', required: false })
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  limit?: number;

  @ApiProperty({ example: 5.0, description: 'Minimum price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  minPrice?: number;

  @ApiProperty({ example: 25.0, description: 'Maximum price', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  maxPrice?: number;

  @ApiProperty({ example: true, description: 'Filter vegetarian items', required: false })
  @IsOptional()
  @IsBoolean()
  isVegetarian?: boolean;

  @ApiProperty({ example: true, description: 'Filter vegan items', required: false })
  @IsOptional()
  @IsBoolean()
  isVegan?: boolean;
}