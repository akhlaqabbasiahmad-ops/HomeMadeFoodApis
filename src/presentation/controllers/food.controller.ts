import {
    Body,
    Controller,
    Delete,
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
import { CreateFoodItemDto, SearchFoodDto, UpdateFoodItemDto } from '../../application/dto/food.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FoodService } from '../services/food.service';

@ApiTags('food')
@Controller('food')
export class FoodController {
  constructor(private readonly foodService: FoodService) {}

  @Get()
  @ApiOperation({ summary: 'Search food items' })
  @ApiResponse({ status: 200, description: 'Food items retrieved successfully' })
  async searchFoodItems(@Query() searchDto: SearchFoodDto) {
    const result = await this.foodService.searchFoodItems(searchDto);
    return {
      success: true,
      data: result,
      message: 'Food items retrieved successfully',
    };
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all food categories' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getCategories() {
    const categories = await this.foodService.getAllCategories();
    return {
      success: true,
      data: categories,
      message: 'Categories retrieved successfully',
    };
  }

  @Get('featured')
  @ApiOperation({ summary: 'Get featured food items' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Featured items retrieved successfully' })
  async getFeaturedItems(@Query('limit') limit: number = 6) {
    const items = await this.foodService.getFeaturedItems(limit);
    return {
      success: true,
      data: items,
      message: 'Featured items retrieved successfully',
    };
  }

  @Get('popular')
  @ApiOperation({ summary: 'Get popular food items' })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Popular items retrieved successfully' })
  async getPopularItems(@Query('limit') limit: number = 6) {
    const items = await this.foodService.getPopularItems(limit);
    return {
      success: true,
      data: items,
      message: 'Popular items retrieved successfully',
    };
  }

  @Get('restaurant/:restaurantId')
  @ApiOperation({ summary: 'Get food items by restaurant' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Restaurant food items retrieved successfully' })
  async getFoodItemsByRestaurant(
    @Param('restaurantId') restaurantId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    const result = await this.foodService.getFoodItemsByRestaurant(restaurantId, page, limit);
    return {
      success: true,
      data: result,
      message: 'Restaurant food items retrieved successfully',
    };
  }

  @Post()
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Create a new food item (restaurant owner only)' })
  @ApiResponse({ status: 201, description: 'Food item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async create(@Body() createFoodItemDto: CreateFoodItemDto, @Request() req) {
    // In a real app, you'd get the restaurant ID from the authenticated user
    const restaurantId = req.user.restaurantId; // Assuming user has restaurantId
    const foodItem = await this.foodService.createFoodItem(restaurantId, createFoodItemDto);
    return {
      success: true,
      data: foodItem,
      message: 'Food item created successfully',
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get food item by ID' })
  @ApiResponse({ status: 200, description: 'Food item found' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async findOne(@Param('id') id: string) {
    const foodItem = await this.foodService.getFoodItemById(id);
    return {
      success: true,
      data: foodItem,
      message: 'Food item retrieved successfully',
    };
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Update food item' })
  @ApiResponse({ status: 200, description: 'Food item updated successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async update(@Param('id') id: string, @Body() updateFoodItemDto: UpdateFoodItemDto) {
    const foodItem = await this.foodService.updateFoodItem(id, updateFoodItemDto);
    return {
      success: true,
      data: foodItem,
      message: 'Food item updated successfully',
    };
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Delete food item' })
  @ApiResponse({ status: 200, description: 'Food item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async remove(@Param('id') id: string) {
    await this.foodService.deleteFoodItem(id);
    return {
      success: true,
      message: 'Food item deleted successfully',
    };
  }
}