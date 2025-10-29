import { Restaurant } from '../entities/restaurant.entity';

export interface IRestaurantRepository {
  findById(id: string): Promise<Restaurant | null>;
  findByOwnerId(ownerId: string): Promise<Restaurant[]>;
  create(restaurant: Omit<Restaurant, 'id' | 'createdAt' | 'updatedAt'>): Promise<Restaurant>;
  update(id: string, updates: Partial<Restaurant>): Promise<Restaurant>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ restaurants: Restaurant[], total: number }>;
  findByCategory(category: string, page: number, limit: number): Promise<{ restaurants: Restaurant[], total: number }>;
  findNearby(latitude: number, longitude: number, radius: number, page: number, limit: number): Promise<{ restaurants: Restaurant[], total: number }>;
  search(query: string, page: number, limit: number): Promise<{ restaurants: Restaurant[], total: number }>;
  findTopRated(limit: number): Promise<Restaurant[]>;
  findFastDelivery(limit: number): Promise<Restaurant[]>;
}