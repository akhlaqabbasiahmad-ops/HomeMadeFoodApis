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

// PostgreSQL database configuration for all environments
export const databaseConfig: DataSourceOptions = {
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'homemadefood_db',
  entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
  migrations: [path.join(__dirname, 'migrations/*.ts')],
  synchronize: process.env.DATABASE_SYNCHRONIZE === 'true',
  logging: process.env.DATABASE_LOGGING === 'true',
  ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
};

// TypeORM configuration factory for NestJS
export const typeOrmConfig = (configService: ConfigService): TypeOrmModuleOptions => {
  const config = {
    type: 'postgres' as const,
    host: configService.get('DATABASE_HOST', 'localhost'),
    port: configService.get('DATABASE_PORT', 5432),
    username: configService.get('DATABASE_USERNAME', 'postgres'),
    password: configService.get('DATABASE_PASSWORD'),
    database: configService.get('DATABASE_NAME', 'homemadefood_db'),
    entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
    synchronize: configService.get('DATABASE_SYNCHRONIZE') === 'true',
    migrations: [path.join(__dirname, 'migrations/*.js')],
    migrationsRun: false,
    ssl: configService.get('DATABASE_SSL', false),
    logging: configService.get('DATABASE_LOGGING') === 'true',
  };
  
  console.log('📊 Database Configuration:');
  console.log(`   Type: PostgreSQL`);
  console.log(`   Host: ${config.host}`);
  console.log(`   Port: ${config.port}`);
  console.log(`   Database: ${config.database}`);
  console.log(`   Username: ${config.username}`);
  console.log(`   Synchronize: ${config.synchronize}`);
  
  return config;
};

// Data source for migrations and CLI
export const dataSource = new DataSource(databaseConfig);