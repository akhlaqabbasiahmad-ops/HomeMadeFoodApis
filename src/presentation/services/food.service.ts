import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from '../../infrastructure/database/entities/category.entity';
import { FoodItemEntity } from '../../infrastructure/database/entities/food-item.entity';

@Injectable()
export class FoodService {
  constructor(
    @InjectRepository(FoodItemEntity)
    private foodRepository: Repository<FoodItemEntity>,
    @InjectRepository(Category)
    private categoryRepository: Repository<Category>,
  ) {}

  async searchFoodItems(searchDto: any) {
    const { query, category, page = 1, limit = 10 } = searchDto;
    const queryBuilder = this.foodRepository.createQueryBuilder('food');
    
    // Always filter by available items
    queryBuilder.where('food.isAvailable = :isAvailable', { isAvailable: true });
    
    // Add search query filter if provided
    if (query) {
      queryBuilder.andWhere(
        '(food.name LIKE :query OR food.description LIKE :query)',
        { query: `%${query}%` }
      );
    }
    
    // Add category filter if provided
    if (category) {
      queryBuilder.andWhere('food.category = :category', { category });
    }

    const [items, total] = await queryBuilder
      .skip((page - 1) * limit)
      .take(limit)
      .orderBy('food.createdAt', 'DESC')
      .getManyAndCount();

    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async getAllCategories() {
    return await this.categoryRepository.find({
      where: { isActive: true },
      order: { name: 'ASC' },
    });
  }

  async getFeaturedItems(limit: number = 10) {
    return await this.foodRepository.find({
      where: { isFeatured: true, isAvailable: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getPopularItems(limit: number = 10) {
    return await this.foodRepository.find({
      where: { isPopular: true, isAvailable: true },
      take: limit,
      order: { createdAt: 'DESC' },
    });
  }

  async getFoodItemsByRestaurant(restaurantId: string, page: number = 1, limit: number = 10) {
    const [items, total] = await this.foodRepository.findAndCount({
      where: { restaurantId, isAvailable: true },
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createFoodItem(restaurantId: string, createDto: any) {
    const foodItem = this.foodRepository.create({
      ...createDto,
      restaurantId,
    });
    return await this.foodRepository.save(foodItem);
  }

  async getFoodItemById(id: string) {
    const item = await this.foodRepository.findOne({ where: { id } });
    // For public endpoints, only return if available
    // Admin endpoints can access unavailable items
    return item;
  }

  async updateFoodItem(id: string, updateDto: any) {
    await this.foodRepository.update(id, updateDto);
    return await this.foodRepository.findOne({ where: { id } });
  }

  async deleteFoodItem(id: string) {
    const result = await this.foodRepository.delete(id);
    return result.affected > 0;
  }

  async getAllFoodItems(page: number = 1, limit: number = 50) {
    // Admin endpoint - returns all items (available and unavailable)
    const [items, total] = await this.foodRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: { createdAt: 'DESC' },
    });
    return { items, total, page, totalPages: Math.ceil(total / limit) };
  }

  async createCategory(categoryData: { name: string; description?: string; icon?: string }) {
    const category = this.categoryRepository.create({
      name: categoryData.name,
      description: categoryData.description,
      icon: categoryData.icon || 'restaurant',
      isActive: true,
    });
    return await this.categoryRepository.save(category);
  }
}
