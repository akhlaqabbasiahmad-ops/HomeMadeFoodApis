import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { FoodItemEntity } from '../../infrastructure/database/entities/food-item.entity';
import { AdminController } from '../controllers/admin.controller';
import { FoodService } from '../services/food.service';

@Module({
  imports: [TypeOrmModule.forFeature([FoodItemEntity, Category])],
  controllers: [AdminController],
  providers: [FoodService],
  exports: [FoodService],
})
export class AdminModule {}
