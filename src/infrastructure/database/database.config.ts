import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions } from '@nestjs/typeorm';
import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';

// Entity imports
import { AddressEntity } from './entities/address.entity';
import { Category } from './entities/category.entity';
import { FoodItemEntity } from './entities/food-item.entity';
import { OrderItem } from './entities/order-item.entity';
import { Order } from './entities/order.entity';
import { RestaurantEntity } from './entities/restaurant.entity';
import { UserEntity } from './entities/user.entity';

// Development configuration using SQLite (no Docker required)
export const databaseConfig: DataSourceOptions = {
  type: 'sqlite',
  database: path.join(__dirname, '../../../data/homemadefood.sqlite'),
  entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  synchronize: process.env.NODE_ENV === 'development', // Auto-sync schema in development
  logging: process.env.NODE_ENV === 'development',
};

// TypeORM configuration factory for NestJS
export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const nodeEnv = configService.get('NODE_ENV', 'development');
  
  if (nodeEnv === 'production') {
    // Production PostgreSQL configuration
    return {
      type: 'postgres',
      host: configService.get('DATABASE_HOST', 'localhost'),
      port: configService.get('DATABASE_PORT', 5432),
      username: configService.get('DATABASE_USERNAME', 'postgres'),
      password: configService.get('DATABASE_PASSWORD'),
      database: configService.get('DATABASE_NAME', 'homemadefood_db'),
      entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
      synchronize: false,
      migrations: [path.join(__dirname, 'migrations/*.js')],
      migrationsRun: true,
      ssl: configService.get('DATABASE_SSL', false),
      logging: false,
    };
  }

  // Development SQLite configuration (no Docker required)
  return {
    type: 'sqlite',
    database: path.join(__dirname, '../../../data/homemadefood.sqlite'),
    entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
    synchronize: true, // Auto-sync schema in development
    logging: true,
  };
};

// Data source for migrations and CLI
export const dataSource = new DataSource(databaseConfig);