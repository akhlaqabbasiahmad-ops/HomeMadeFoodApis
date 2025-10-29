import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { FoodItemEntity } from './food-item.entity';

@Entity('restaurants')
export class RestaurantEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviews: number;

  @Column({ type: 'varchar', length: 50 })
  deliveryTime: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  deliveryFee: number;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  minimumOrder: number;

  @Column({ type: 'json' })
  categories: string[];

  @Column({ type: 'boolean', default: true })
  isOpen: boolean;

  @Column({ type: 'decimal', precision: 5, scale: 2 })
  distance: number;

  @Column({ type: 'decimal', precision: 10, scale: 8 })
  latitude: number;

  @Column({ type: 'decimal', precision: 11, scale: 8 })
  longitude: number;

  @Column({ type: 'uuid' })
  ownerId: string;

  @Column({ type: 'boolean', default: true })
  isActive: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}