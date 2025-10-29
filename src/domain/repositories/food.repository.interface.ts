import { Category, FoodItem } from '../entities/food.entity';

export interface IFoodRepository {
  findById(id: string): Promise<FoodItem | null>;
  findByRestaurantId(restaurantId: string, page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  findByCategory(category: string, page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  create(foodItem: Omit<FoodItem, 'id' | 'createdAt' | 'updatedAt'>): Promise<FoodItem>;
  update(id: string, updates: Partial<FoodItem>): Promise<FoodItem>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  search(query: string, page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  findFeatured(limit: number): Promise<FoodItem[]>;
  findPopular(limit: number): Promise<FoodItem[]>;
  findByPriceRange(minPrice: number, maxPrice: number, page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  findVegetarian(page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
  findVegan(page: number, limit: number): Promise<{ items: FoodItem[], total: number }>;
}

export interface ICategoryRepository {
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
  create(category: Omit<Category, 'id' | 'createdAt'>): Promise<Category>;
  update(id: string, updates: Partial<Category>): Promise<Category>;
  delete(id: string): Promise<void>;
  findActive(): Promise<Category[]>;
}