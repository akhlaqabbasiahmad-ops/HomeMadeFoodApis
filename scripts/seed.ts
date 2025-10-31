import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { DatabaseSeeder } from '../src/infrastructure/database/seeds/database-seeder';
import { AddressEntity } from '../src/infrastructure/database/entities/address.entity';
import { Category } from '../src/infrastructure/database/entities/category.entity';
import { FoodItemEntity } from '../src/infrastructure/database/entities/food-item.entity';
import { OrderItem } from '../src/infrastructure/database/entities/order-item.entity';
import { Order } from '../src/infrastructure/database/entities/order.entity';
import { RestaurantEntity } from '../src/infrastructure/database/entities/restaurant.entity';
import { UserEntity } from '../src/infrastructure/database/entities/user.entity';

// Load .env file (looks for .env in project root)
// Try multiple paths to find .env file
const envPaths = [
  path.join(__dirname, '../.env'),      // From scripts/ directory
  path.join(process.cwd(), '.env'),    // From current working directory
];

let envLoaded = false;
for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    envLoaded = true;
    console.log(`📄 Loaded environment variables from ${envPath}`);
    break;
  }
}

// If no .env file found, try default location
if (!envLoaded) {
  const defaultResult = dotenv.config();
  if (!defaultResult.error) {
    envLoaded = true;
    console.log(`📄 Loaded environment variables from default .env location`);
  }
}

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
    console.log(`   Port: ${process.env.DATABASE_PORT || '5432'}`);
    console.log(`   Database: ${process.env.DATABASE_NAME || 'homemadefood_db'}`);
    console.log(`   Username: ${process.env.DATABASE_USERNAME || 'postgres'}`);
    
    // Validate required environment variables
    if (!process.env.DATABASE_PASSWORD) {
      console.error('❌ Error: DATABASE_PASSWORD environment variable is required for production');
      if (!envLoaded) {
        console.error('   ⚠️  No .env file was found or loaded.');
        console.error('   Please ensure you have a .env file in the project root with DATABASE_PASSWORD set.');
      } else {
        console.error('   ⚠️  .env file was loaded, but DATABASE_PASSWORD is missing or empty.');
        console.error('   Please add DATABASE_PASSWORD=your-password to your .env file.');
      }
      console.error('\n   Current values:');
      console.error(`   - DATABASE_HOST: ${process.env.DATABASE_HOST || '(default: localhost)'}`);
      console.error(`   - DATABASE_PORT: ${process.env.DATABASE_PORT || '(default: 5432)'}`);
      console.error(`   - DATABASE_USERNAME: ${process.env.DATABASE_USERNAME || '(default: postgres)'}`);
      console.error(`   - DATABASE_PASSWORD: ${process.env.DATABASE_PASSWORD ? '***' : '(MISSING)'}`);
      console.error(`   - DATABASE_NAME: ${process.env.DATABASE_NAME || '(default: homemadefood_db)'}`);
      process.exit(1);
    }
    
    if (!process.env.DATABASE_HOST || process.env.DATABASE_HOST === 'localhost') {
      console.warn('⚠️  Warning: Using localhost. Make sure PostgreSQL is running.');
      console.warn('   If using Docker: docker-compose up -d postgres');
      console.warn('   If using local PostgreSQL: Make sure the service is started');
    }
  } else {
    console.log('📊 Using SQLite database');
  }
  
  const dataSource = new DataSource(databaseConfig);
  
  try {
    console.log('🔌 Attempting to connect to database...');
    await dataSource.initialize();
    console.log('✅ Database connection established');
    
    // Run the database seeder
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Error during seeding:');
    
    if (error.code === 'ECONNREFUSED') {
      console.error('\n🔍 Connection Refused - Troubleshooting steps:');
      console.error('   1. Check if PostgreSQL is running:');
      console.error('      - Docker: docker-compose up -d postgres');
      console.error('      - Local: Check PostgreSQL service status');
      console.error(`   2. Verify connection details:`);
      console.error(`      - Host: ${process.env.DATABASE_HOST || 'localhost'}`);
      console.error(`      - Port: ${process.env.DATABASE_PORT || '5432'}`);
      console.error('   3. Check if PostgreSQL is listening on the correct port:');
      console.error('      - netstat -an | grep 5432 (Linux/Mac)');
      console.error('      - netstat -an | findstr 5432 (Windows)');
      console.error('   4. For remote databases, verify network connectivity and firewall rules');
    } else if (error.code === 'ENOTFOUND') {
      console.error('\n🔍 Host Not Found:');
      console.error(`   The host "${process.env.DATABASE_HOST || 'localhost'}" could not be resolved.`);
      console.error('   Check your DATABASE_HOST environment variable.');
    } else if (error.code === '28P01' || error.message?.includes('password')) {
      console.error('\n🔍 Authentication Failed:');
      console.error('   Invalid username or password.');
      console.error('   Check your DATABASE_USERNAME and DATABASE_PASSWORD environment variables.');
    } else if (error.code === '3D000' || error.message?.includes('database')) {
      const dbName = process.env.DATABASE_NAME || 'homemadefood_db';
      console.error('\n🔍 Database Not Found:');
      console.error(`   The database "${dbName}" does not exist.`);
      console.error('   Create the database first using one of these methods:');
      console.error(`\n   1. Using psql command:`);
      console.error(`      psql -U ${process.env.DATABASE_USERNAME || 'postgres'} -c "CREATE DATABASE ${dbName};"`);
      console.error(`\n   2. Using psql interactive session:`);
      console.error(`      psql -U ${process.env.DATABASE_USERNAME || 'postgres'}`);
      console.error(`      Then run: CREATE DATABASE ${dbName};`);
      console.error(`\n   3. With password prompt:`);
      console.error(`      PGPASSWORD='${process.env.DATABASE_PASSWORD ? '***' : 'your-password'}' psql -U ${process.env.DATABASE_USERNAME || 'postgres'} -h ${process.env.DATABASE_HOST || 'localhost'} -c "CREATE DATABASE ${dbName};"`);
    } else {
      console.error('   Error details:', error.message);
      if (error.code) {
        console.error(`   Error code: ${error.code}`);
      }
    }
    
    console.error('\n💡 Tip: Make sure your environment variables are set correctly.');
    console.error('   Required variables for production:');
    console.error('   - DATABASE_HOST');
    console.error('   - DATABASE_PORT');
    console.error('   - DATABASE_USERNAME');
    console.error('   - DATABASE_PASSWORD');
    console.error('   - DATABASE_NAME');
    
    process.exit(1);
  } finally {
    if (dataSource.isInitialized) {
      await dataSource.destroy();
      console.log('🔌 Database connection closed');
    }
    process.exit(0);
  }
}

runSeeder();