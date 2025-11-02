import {
  Body,
  Controller,
  Get,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { MealSuggestionService, MealSuggestion } from '../services/meal-suggestion.service';

interface MealSuggestionQueryDto {
  dietaryRestrictions?: string;
  favoriteCategories?: string;
  maxPrice?: number;
}

@ApiTags('meal-suggestions')
@Controller('meal-suggestions')
export class MealSuggestionController {
  constructor(private readonly mealSuggestionService: MealSuggestionService) {}

  @Get('today')
  @ApiOperation({ 
    summary: 'Get AI-suggested meal for today',
    description: 'Uses AI to suggest the perfect meal for today based on time, day of week, and available food items'
  })
  @ApiQuery({ 
    name: 'dietaryRestrictions', 
    required: false, 
    type: String,
    description: 'Comma-separated dietary restrictions (e.g., vegetarian,vegan,no-spicy)'
  })
  @ApiQuery({ 
    name: 'favoriteCategories', 
    required: false, 
    type: String,
    description: 'Comma-separated favorite categories'
  })
  @ApiQuery({ 
    name: 'maxPrice', 
    required: false, 
    type: Number,
    description: 'Maximum price for the meal'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Meal suggestion retrieved successfully',
    schema: {
      example: {
        success: true,
        data: {
          meal: {
            name: 'Grilled Chicken Sandwich',
            description: 'Delicious grilled chicken with fresh vegetables',
            category: 'Sandwiches',
            price: 12.99,
            restaurantName: 'Food Haven',
            id: 'uuid-here',
            image: 'https://example.com/image.jpg',
            rating: 4.5
          },
          reason: 'Perfect lunch choice for a Monday!',
          nutritionalInfo: {
            calories: 450,
            isVegetarian: false,
            isVegan: false,
            isSpicy: false
          }
        },
        message: 'Meal suggestion retrieved successfully'
      }
    }
  })
  async getTodayMealSuggestion(@Query() query: MealSuggestionQueryDto): Promise<{
    success: boolean;
    data: MealSuggestion;
    message: string;
  }> {
    const userPreferences = {
      dietaryRestrictions: query.dietaryRestrictions 
        ? query.dietaryRestrictions.split(',').map(s => s.trim())
        : undefined,
      favoriteCategories: query.favoriteCategories 
        ? query.favoriteCategories.split(',').map(s => s.trim())
        : undefined,
      maxPrice: query.maxPrice ? Number(query.maxPrice) : undefined,
    };

    const suggestion = await this.mealSuggestionService.suggestTodayMeal(userPreferences);

    return {
      success: true,
      data: suggestion,
      message: 'Meal suggestion retrieved successfully',
    };
  }

  @Post('suggest')
  @ApiOperation({ 
    summary: 'Get AI-suggested meal with preferences',
    description: 'Uses AI to suggest a meal based on user preferences and available food items'
  })
  @ApiResponse({ 
    status: 200, 
    description: 'Meal suggestion retrieved successfully'
  })
  async suggestMeal(@Body() preferences: {
    dietaryRestrictions?: string[];
    favoriteCategories?: string[];
    maxPrice?: number;
  }): Promise<{
    success: boolean;
    data: MealSuggestion;
    message: string;
  }> {
    const suggestion = await this.mealSuggestionService.suggestTodayMeal(preferences);

    return {
      success: true,
      data: suggestion,
      message: 'Meal suggestion retrieved successfully',
    };
  }
}

