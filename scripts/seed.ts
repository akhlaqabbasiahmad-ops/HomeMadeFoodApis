import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { DatabaseSeeder } from '../src/infrastructure/database/seeds/database-seeder';
import { AddressEntity } from '../src/infrastructure/database/entities/address.entity';
import { Category } from '../src/infrastructure/database/entities/category.entity';
import { FoodItemEntity } from '../src/infrastructure/database/entities/food-item.entity';
import { OrderItem } from '../src/infrastructure/database/entities/order-item.entity';
import { Order } from '../src/infrastructure/database/entities/order.entity';
import { RestaurantEntity } from '../src/infrastructure/database/entities/restaurant.entity';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';

// Load environment variables
const nodeEnv = process.env.NODE_ENV || 'development';

// Create database configuration based on environment
const getDatabaseConfig = (): DataSourceOptions => {
  if (nodeEnv === 'production') {
    // Production PostgreSQL configuration
    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'homemadefood_db',
      entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
      synchronize: false,
      logging: process.env.DATABASE_LOGGING === 'true',
      ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
    };
  }

  // Development SQLite configuration
  return {
    type: 'sqlite' as const,
    database: path.join(__dirname, '../data/homemadefood.sqlite'),
    entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
    synchronize: true,
    logging: true,
  };
};

const databaseConfig = getDatabaseConfig();

async function runSeeder() {
  console.log(`🚀 Starting database seeding process for ${nodeEnv} environment...`);
  
  if (nodeEnv === 'production') {
    console.log('📊 Using PostgreSQL database');
    console.log(`   Host: ${process.env.DATABASE_HOST || 'localhost'}`);
    console.log(`   Database: ${process.env.DATABASE_NAME || 'homemadefood_db'}`);
  } else {
    console.log('📊 Using SQLite database');
  }
  
  const dataSource = new DataSource(databaseConfig);
  
  try {
    await dataSource.initialize();
    console.log('📦 Database connection established');
    
    // Run the database seeder
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Error during seeding:', error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
    console.log('🔌 Database connection closed');
    process.exit(0);
  }
}

runSeeder();