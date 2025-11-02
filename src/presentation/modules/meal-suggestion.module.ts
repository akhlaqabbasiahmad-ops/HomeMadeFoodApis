import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { FoodItemEntity } from '../../infrastructure/database/entities/food-item.entity';
import { MealSuggestionController } from '../controllers/meal-suggestion.controller';
import { MealSuggestionService } from '../services/meal-suggestion.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItemEntity])],
  controllers: [MealSuggestionController],
  providers: [MealSuggestionService],
  exports: [MealSuggestionService],
})
export class MealSuggestionModule {}

