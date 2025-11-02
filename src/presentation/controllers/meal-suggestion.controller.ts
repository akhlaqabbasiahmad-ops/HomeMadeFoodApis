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
import { MealSuggestionService, DualMealSuggestion } from '../services/meal-suggestion.service';

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
    summary: 'Get dual AI-suggested meals for today',
    description: 'Returns two meal suggestions: 1) A meal from your app database, and 2) A traditional Pakistani meal suggestion based on current season, weather, and cultural context'
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
          fromApp: {
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
          culturalSuggestion: {
            name: 'Biryani',
            description: 'Fragrant rice dish with meat or vegetables, layered with spices. Celebration meal.',
            category: 'Traditional',
            reason: 'Perfect for spring celebrations and gatherings',
            culturalContext: 'Most beloved dish in Pakistan, served on special occasions',
            season: 'Spring',
            weather: 'Moderate',
            estimatedPrice: 800,
            nutritionalInfo: {
              calories: 600,
              isVegetarian: false,
              isVegan: false,
              isSpicy: true
            },
            image: 'https://source.unsplash.com/400x300/?pakistani+food+biryani'
          }
        },
        message: 'Meal suggestions retrieved successfully'
      }
    }
  })
  async getTodayMealSuggestion(@Query() query: MealSuggestionQueryDto): Promise<{
    success: boolean;
    data: DualMealSuggestion;
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
    summary: 'Get dual AI-suggested meals with preferences',
    description: 'Returns two meal suggestions based on preferences: 1) From your app database, and 2) Traditional Pakistani meal based on season, weather, and culture'
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
    data: DualMealSuggestion;
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

