export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly userId: string,
    public readonly restaurantId: string,
    public readonly restaurantName: string,
    public readonly items: OrderItem[],
    public readonly totalAmount: number,
    public readonly deliveryFee: number,
    public readonly tax: number,
    public readonly grandTotal: number,
    public readonly status: OrderStatus,
    public readonly deliveryAddress: OrderAddress,
    public readonly paymentMethod: string,
    public readonly orderDate: Date,
    public readonly estimatedDeliveryTime: Date,
    public readonly trackingId?: string,
    public readonly specialInstructions?: string,
    public readonly createdAt: Date = new Date(),
    public readonly updatedAt: Date = new Date(),
  ) {}

  public updateStatus(status: OrderStatus): Order {
    return new Order(
      this.id,
      this.userId,
      this.restaurantId,
      this.restaurantName,
      this.items,
      this.totalAmount,
      this.deliveryFee,
      this.tax,
      this.grandTotal,
      status,
      this.deliveryAddress,
      this.paymentMethod,
      this.orderDate,
      this.estimatedDeliveryTime,
      this.trackingId,
      this.specialInstructions,
      this.createdAt,
      new Date(),
    );
  }

  public cancel(reason?: string): Order {
    if (this.status !== OrderStatus.PENDING && this.status !== OrderStatus.CONFIRMED) {
      throw new Error('Order cannot be cancelled in current status');
    }
    return this.updateStatus(OrderStatus.CANCELLED);
  }

  public confirm(): Order {
    if (this.status !== OrderStatus.PENDING) {
      throw new Error('Only pending orders can be confirmed');
    }
    return this.updateStatus(OrderStatus.CONFIRMED);
  }

  public startPreparing(): Order {
    if (this.status !== OrderStatus.CONFIRMED) {
      throw new Error('Order must be confirmed before preparing');
    }
    return this.updateStatus(OrderStatus.PREPARING);
  }

  public markReady(): Order {
    if (this.status !== OrderStatus.PREPARING) {
      throw new Error('Order must be preparing before marking as ready');
    }
    return this.updateStatus(OrderStatus.READY);
  }

  public markOnTheWay(): Order {
    if (this.status !== OrderStatus.READY) {
      throw new Error('Order must be ready before marking as on the way');
    }
    return this.updateStatus(OrderStatus.ON_THE_WAY);
  }

  public markDelivered(): Order {
    if (this.status !== OrderStatus.ON_THE_WAY) {
      throw new Error('Order must be on the way before marking as delivered');
    }
    return this.updateStatus(OrderStatus.DELIVERED);
  }
}

export class OrderItem {
  constructor(
    public readonly id: string,
    public readonly foodItemId: string,
    public readonly name: string,
    public readonly image: string,
    public readonly price: number,
    public readonly quantity: number,
    public readonly totalPrice: number,
    public readonly specialInstructions?: string,
  ) {}

  public updateQuantity(quantity: number): OrderItem {
    return new OrderItem(
      this.id,
      this.foodItemId,
      this.name,
      this.image,
      this.price,
      quantity,
      this.price * quantity,
      this.specialInstructions,
    );
  }
}

export class OrderAddress {
  constructor(
    public readonly title: string,
    public readonly address: string,
    public readonly latitude: number,
    public readonly longitude: number,
  ) {}
}