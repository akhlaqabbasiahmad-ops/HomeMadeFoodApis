import { Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn } from 'typeorm';
// import { RestaurantEntity } from './restaurant.entity';

@Entity('food_items')
export class FoodItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 100 })
  name: string;

  @Column({ type: 'text' })
  description: string;

  @Column({ type: 'varchar', length: 500 })
  image: string;

  @Column({ type: 'decimal', precision: 8, scale: 2 })
  price: number;

  @Column({ type: 'decimal', precision: 8, scale: 2, nullable: true })
  originalPrice: number;

  @Column({ type: 'decimal', precision: 3, scale: 2, default: 0 })
  rating: number;

  @Column({ type: 'int', default: 0 })
  reviews: number;

  @Column({ type: 'varchar', length: 50 })
  category: string;

  @Column({ type: 'uuid' })
  restaurantId: string;

  @Column({ type: 'varchar', length: 100 })
  restaurantName: string;

  @Column({ type: 'json' })
  ingredients: string[];

  @Column({ type: 'json', nullable: true })
  allergens: string[];

  @Column({ type: 'boolean', default: false })
  isVegetarian: boolean;

  @Column({ type: 'boolean', default: false })
  isVegan: boolean;

  @Column({ type: 'boolean', default: false })
  isSpicy: boolean;

  @Column({ type: 'int' })
  preparationTime: number;

  @Column({ type: 'int', nullable: true })
  calories: number;

  @Column({ type: 'boolean', default: true })
  isAvailable: boolean;

  @Column({ type: 'boolean', default: false })
  isFeatured: boolean;

  @Column({ type: 'boolean', default: false })
  isPopular: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
  // restaurant: RestaurantEntity;
}