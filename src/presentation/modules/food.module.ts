import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { FoodItemEntity } from '../../infrastructure/database/entities/food-item.entity';
import { FoodController } from '../controllers/food.controller';
import { FoodService } from '../services/food.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItemEntity, Category])],
  controllers: [FoodController],
  providers: [FoodService],
  exports: [FoodService],
})
export class FoodModule {}