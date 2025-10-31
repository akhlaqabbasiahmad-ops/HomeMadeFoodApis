import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
import { OrderItem } from './order-item.entity';

export enum OrderStatus {
  PENDING = 'pending',
  CONFIRMED = 'confirmed',
  PREPARING = 'preparing',
  READY = 'ready',
  ON_THE_WAY = 'on_the_way',
  DELIVERED = 'delivered',
  CANCELLED = 'cancelled',
}

@Entity('orders')
export class Order {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column('uuid')
  userId: string;

  @Column({ nullable: true })
  restaurantId: string;

  @Column({ nullable: true })
  restaurantName: string;

  @OneToMany(() => OrderItem, item => item.order, { cascade: true, eager: true })
  items: OrderItem[];

  @Column('decimal', { precision: 10, scale: 2 })
  totalAmount: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  deliveryFee: number;

  @Column('decimal', { precision: 10, scale: 2, default: 0 })
  tax: number;

  @Column('decimal', { precision: 10, scale: 2 })
  grandTotal: number;

  @Column({
    type: 'varchar',
    default: 'pending',
  })
  status: string;

  @Column('json')
  deliveryAddress: {
    title: string;
    address: string;
    latitude: number;
    longitude: number;
  };

  @Column()
  paymentMethod: string;

  // Using Date type without explicit database type - TypeORM will use correct type per database
  @Column({ default: () => 'CURRENT_TIMESTAMP' })
  orderDate: Date;

  @Column({ nullable: true })
  estimatedDeliveryTime: Date;

  @Column({ nullable: true })
  trackingId: string;

  @Column('text', { nullable: true })
  specialInstructions: string;

  @Column({ nullable: true })
  actualDeliveryTime: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}