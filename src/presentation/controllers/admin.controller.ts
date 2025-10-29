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
import { CreateFoodItemDto, UpdateFoodItemDto } from '../../application/dto/food.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { FoodService } from '../services/food.service';

@ApiTags('admin')
@Controller('admin')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AdminController {
  constructor(private readonly foodService: FoodService) {}

  @Post('food')
  @ApiOperation({ summary: 'Create a new food item (Admin only)' })
  @ApiResponse({ status: 201, description: 'Food item created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  @ApiResponse({ status: 401, description: 'Unauthorized' })
  async createFoodItem(@Body() createFoodItemDto: CreateFoodItemDto, @Request() req) {
    try {
      // For admin, we'll use a default restaurant ID or get it from the request
      const restaurantId = createFoodItemDto.restaurantId || 'default-restaurant-id';
      const restaurantName = createFoodItemDto.restaurantName || 'Admin Restaurant';
      
      const foodItem = await this.foodService.createFoodItem(restaurantId, {
        ...createFoodItemDto,
        restaurantId,
        restaurantName,
      });
      
      return {
        success: true,
        data: foodItem,
        message: 'Food item created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create food item',
        message: 'Error creating food item',
      };
    }
  }

  @Get('food')
  @ApiOperation({ summary: 'Get all food items (Admin only)' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({ status: 200, description: 'Food items retrieved successfully' })
  async getAllFoodItems(
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    try {
      const result = await this.foodService.getAllFoodItems(page, limit);
      return {
        success: true,
        data: result,
        message: 'Food items retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve food items',
        message: 'Error retrieving food items',
      };
    }
  }

  @Get('food/:id')
  @ApiOperation({ summary: 'Get food item by ID (Admin only)' })
  @ApiResponse({ status: 200, description: 'Food item found' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async getFoodItemById(@Param('id') id: string) {
    try {
      const foodItem = await this.foodService.getFoodItemById(id);
      return {
        success: true,
        data: foodItem,
        message: 'Food item retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve food item',
        message: 'Error retrieving food item',
      };
    }
  }

  @Patch('food/:id')
  @ApiOperation({ summary: 'Update food item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Food item updated successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async updateFoodItem(
    @Param('id') id: string,
    @Body() updateFoodItemDto: UpdateFoodItemDto,
  ) {
    try {
      const foodItem = await this.foodService.updateFoodItem(id, updateFoodItemDto);
      return {
        success: true,
        data: foodItem,
        message: 'Food item updated successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to update food item',
        message: 'Error updating food item',
      };
    }
  }

  @Delete('food/:id')
  @ApiOperation({ summary: 'Delete food item (Admin only)' })
  @ApiResponse({ status: 200, description: 'Food item deleted successfully' })
  @ApiResponse({ status: 404, description: 'Food item not found' })
  async deleteFoodItem(@Param('id') id: string) {
    try {
      await this.foodService.deleteFoodItem(id);
      return {
        success: true,
        message: 'Food item deleted successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to delete food item',
        message: 'Error deleting food item',
      };
    }
  }

  @Post('categories')
  @ApiOperation({ summary: 'Create a new category (Admin only)' })
  @ApiResponse({ status: 201, description: 'Category created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  async createCategory(@Body() categoryData: {
    name: string;
    description?: string;
    icon?: string;
  }) {
    try {
      const category = await this.foodService.createCategory(categoryData);
      return {
        success: true,
        data: category,
        message: 'Category created successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to create category',
        message: 'Error creating category',
      };
    }
  }

  @Get('categories')
  @ApiOperation({ summary: 'Get all categories (Admin only)' })
  @ApiResponse({ status: 200, description: 'Categories retrieved successfully' })
  async getAllCategories() {
    try {
      const categories = await this.foodService.getAllCategories();
      return {
        success: true,
        data: categories,
        message: 'Categories retrieved successfully',
      };
    } catch (error) {
      return {
        success: false,
        error: error.message || 'Failed to retrieve categories',
        message: 'Error retrieving categories',
      };
    }
  }
}
