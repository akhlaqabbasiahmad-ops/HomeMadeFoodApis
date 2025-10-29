import { Order, OrderStatus } from '../entities/order.entity';

export interface IOrderRepository {
  findById(id: string): Promise<Order | null>;
  findByUserId(userId: string, page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  findByRestaurantId(restaurantId: string, page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  findByStatus(status: OrderStatus, page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  create(order: Omit<Order, 'id' | 'createdAt' | 'updatedAt'>): Promise<Order>;
  update(id: string, updates: Partial<Order>): Promise<Order>;
  delete(id: string): Promise<void>;
  findAll(page: number, limit: number): Promise<{ orders: Order[], total: number }>;
  findByTrackingId(trackingId: string): Promise<Order | null>;
  findRecentByUserId(userId: string, limit: number): Promise<Order[]>;
  findActiveByUserId(userId: string): Promise<Order[]>;
  findTodaysByRestaurant(restaurantId: string): Promise<Order[]>;
  getOrderStats(restaurantId: string, startDate: Date, endDate: Date): Promise<{
    totalOrders: number;
    totalRevenue: number;
    avgOrderValue: number;
    statusBreakdown: Record<OrderStatus, number>;
  }>;
}