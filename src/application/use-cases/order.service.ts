import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { OrderItem } from '../../infrastructure/database/entities/order-item.entity';
import { Order, OrderStatus } from '../../infrastructure/database/entities/order.entity';

export interface CreateOrderDto {
  userId: string;
  restaurantId: string;
  restaurantName: string;
  items: {
    foodItemId: string;
    name: string;
    image: string;
    price: number;
    quantity: number;
    specialInstructions?: string;
  }[];
  totalAmount: number;
  deliveryFee: number;
  tax: number;
  grandTotal: number;
  deliveryAddress: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  };
  paymentMethod: string;
  specialInstructions?: string;
  promoCode?: string;
  promoDiscount?: number;
}

@Injectable()
export class OrderService {
  constructor(
    @InjectRepository(Order)
    private orderRepository: Repository<Order>,
    @InjectRepository(OrderItem)
    private orderItemRepository: Repository<OrderItem>,
  ) {}

  async createOrder(createOrderDto: CreateOrderDto): Promise<Order> {
    try {
      // Validate order data
      this.validateOrderData(createOrderDto);

      // Create order entity
      const order = new Order();
      order.userId = createOrderDto.userId;
      order.restaurantId = createOrderDto.restaurantId;
      order.restaurantName = createOrderDto.restaurantName;
      order.totalAmount = createOrderDto.totalAmount;
      order.deliveryFee = createOrderDto.deliveryFee;
      order.tax = createOrderDto.tax;
      order.grandTotal = createOrderDto.grandTotal;
      order.status = OrderStatus.PENDING;
      order.deliveryAddress = {
        title: createOrderDto.deliveryAddress.title,
        address: createOrderDto.deliveryAddress.address,
        latitude: createOrderDto.deliveryAddress.latitude,
        longitude: createOrderDto.deliveryAddress.longitude,
      };
      order.paymentMethod = createOrderDto.paymentMethod;
      order.orderDate = new Date();
      order.estimatedDeliveryTime = new Date(Date.now() + 35 * 60 * 1000); // 35 minutes from now
      order.trackingId = `TRK_${Date.now()}`;
      order.specialInstructions = createOrderDto.specialInstructions;

      // Save order first to get the ID
      const savedOrder = await this.orderRepository.save(order);

      // Create order items
      const orderItems = createOrderDto.items.map(item => {
        const orderItem = new OrderItem();
        orderItem.orderId = savedOrder.id;
        orderItem.foodItemId = item.foodItemId;
        orderItem.name = item.name;
        orderItem.image = item.image;
        orderItem.price = item.price;
        orderItem.quantity = item.quantity;
        orderItem.totalPrice = item.price * item.quantity;
        orderItem.specialInstructions = item.specialInstructions;
        return orderItem;
      });

      // Save order items
      await this.orderItemRepository.save(orderItems);

      // Return the complete order with items
      const completeOrder = await this.orderRepository.findOne({
        where: { id: savedOrder.id },
        relations: ['items']
      });

      console.log('💾 Order saved to database:', completeOrder.id);
      return completeOrder;
    } catch (error) {
      console.error('Error creating order:', error);
      throw new BadRequestException('Failed to create order');
    }
  }

  async getOrderHistory(userId: string, page: number = 1, limit: number = 10) {
    try {
      console.log(`📊 Fetching order history for user ${userId}, page ${page}, limit ${limit}`);
      
      // Query database for user's orders
      const [orders, total] = await this.orderRepository.findAndCount({
        where: { userId },
        relations: ['items'],
        order: { orderDate: 'DESC' },
        skip: (page - 1) * limit,
        take: limit,
      });

      console.log(`📊 Found ${total} orders in database for user ${userId}`);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit),
        hasNext: (page * limit) < total,
        hasPrevious: page > 1
      };
    } catch (error) {
      console.error('Error fetching order history:', error);
      throw new NotFoundException('Failed to fetch order history');
    }
  }

  async getOrderById(orderId: string, userId: string): Promise<Order> {
    try {
      const order = await this.orderRepository.findOne({
        where: { id: orderId, userId },
        relations: ['items'],
      });
      
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      return order;
    } catch (error) {
      console.error('Error fetching order:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to fetch order');
    }
  }

  async updateOrderStatus(orderId: string, status: OrderStatus, userId?: string): Promise<Order> {
    try {
      // For now, return mock updated order
      // In a real implementation, you'd update the database
      const order = await this.orderRepository.findOne({
        where: { id: orderId, ...(userId ? { userId } : {}) },
        relations: ['items'],
      });
      
      if (!order) {
        throw new NotFoundException(`Order with ID ${orderId} not found`);
      }

      order.status = status;
      order.updatedAt = new Date();
      console.log(`Order ${orderId} status updated to ${status}`);
      
      return await this.orderRepository.save(order);
    } catch (error) {
      console.error('Error updating order status:', error);
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to update order status');
    }
  }

  async cancelOrder(orderId: string, userId: string, reason?: string): Promise<Order> {
    try {
      const order = await this.getOrderById(orderId, userId);
      
      // Check if order can be cancelled
      if (order.status !== OrderStatus.PENDING && order.status !== OrderStatus.CONFIRMED) {
        throw new BadRequestException('Order cannot be cancelled in current status');
      }

      order.status = OrderStatus.CANCELLED;
      order.updatedAt = new Date();
      console.log(`Order ${orderId} cancelled. Reason: ${reason}`);
      
      return order;
    } catch (error) {
      console.error('Error cancelling order:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException('Failed to cancel order');
    }
  }

  private validateOrderData(orderData: CreateOrderDto): void {
    if (!orderData.items || orderData.items.length === 0) {
      throw new BadRequestException('Order must contain at least one item');
    }

    if (!orderData.deliveryAddress || !orderData.deliveryAddress.address) {
      throw new BadRequestException('Delivery address is required');
    }

    if (!orderData.paymentMethod) {
      throw new BadRequestException('Payment method is required');
    }

    if (orderData.totalAmount <= 0 || orderData.grandTotal <= 0) {
      throw new BadRequestException('Invalid order amounts');
    }
  }
}