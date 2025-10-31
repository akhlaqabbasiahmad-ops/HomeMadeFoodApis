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

// Create PostgreSQL database configuration
const getDatabaseConfig = (): DataSourceOptions => {
  return {
    type: 'postgres',
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'homemadefood_db',
    entities: [UserEntity, AddressEntity, RestaurantEntity, FoodItemEntity, Category, Order, OrderItem],
    synchronize: process.env.DATABASE_SYNCHRONIZE === 'true', // Allow override for initial setup
    migrations: [path.join(__dirname, '../src/infrastructure/database/migrations/*.ts')],
    migrationsRun: false, // We'll run manually if needed
    logging: process.env.DATABASE_LOGGING === 'true',
    ssl: process.env.DATABASE_SSL === 'true' ? { rejectUnauthorized: false } : false,
  };
};

const databaseConfig = getDatabaseConfig();

async function runSeeder() {
  console.log('🚀 Starting database seeding process...');
  console.log('📊 Using PostgreSQL database');
  console.log(`   Host: ${process.env.DATABASE_HOST || 'localhost'}`);
  console.log(`   Port: ${process.env.DATABASE_PORT || '5432'}`);
  console.log(`   Database: ${process.env.DATABASE_NAME || 'homemadefood_db'}`);
  console.log(`   Username: ${process.env.DATABASE_USERNAME || 'postgres'}`);
  
  // Warn about synchronize
  if (process.env.DATABASE_SYNCHRONIZE === 'true') {
    console.warn('\n⚠️  WARNING: DATABASE_SYNCHRONIZE=true is enabled!');
    console.warn('   This will auto-create/update database tables.');
    console.warn('   ⚠️  REMOVE DATABASE_SYNCHRONIZE=true from .env after setup!');
    console.warn('   Synchronize should NEVER be enabled in production long-term.\n');
  } else {
    console.log('   Schema sync: disabled (using migrations)');
  }
  
  // Validate required environment variables
  if (!process.env.DATABASE_PASSWORD) {
    console.error('❌ Error: DATABASE_PASSWORD environment variable is required');
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
  
  const dataSource = new DataSource(databaseConfig);
  
  try {
    console.log('🔌 Attempting to connect to database...');
    console.log(`   Connection details:`);
    console.log(`   - Type: ${databaseConfig.type}`);
    console.log(`   - Host: ${(databaseConfig as any).host}`);
    console.log(`   - Port: ${(databaseConfig as any).port}`);
    console.log(`   - Database: ${(databaseConfig as any).database}`);
    console.log(`   - Username: ${(databaseConfig as any).username}`);
    console.log(`   - Password: ${(databaseConfig as any).password ? '***' : '(empty)'}`);
    
    await dataSource.initialize();
    console.log('✅ Database connection established');
    
    // Verify database connection
    const result = await dataSource.query('SELECT current_database(), current_user');
    console.log(`   Connected to database: ${result[0].current_database} as user: ${result[0].current_user}`);
    
    // If synchronize is enabled, warn about schema creation
    if (process.env.DATABASE_SYNCHRONIZE === 'true') {
      console.log('🔄 Synchronize is enabled - tables will be created automatically if they don\'t exist...');
    }
    
    // Run the database seeder
    const seeder = new DatabaseSeeder(dataSource);
    await seeder.run();
    
    console.log('🎉 Database seeding completed successfully!');
  } catch (error: any) {
    console.error('\n❌ Error during seeding:');
    console.error(`   Error Code: ${error.code || 'N/A'}`);
    console.error(`   Error Message: ${error.message || 'Unknown error'}`);
    console.error(`   Error Stack: ${error.stack ? error.stack.split('\n').slice(0, 3).join('\n') : 'N/A'}`);
    
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
    } else if (error.code === '42P01' || error.message?.includes('relation') || error.message?.includes('does not exist')) {
      const relationMatch = error.message?.match(/relation "(\w+)" does not exist/);
      const relationName = relationMatch ? relationMatch[1] : 'table';
      
      console.error('\n🔍 Table/Relation Not Found:');
      console.error(`   The table "${relationName}" does not exist in the database.`);
      console.error(`   Error code: ${error.code || 'N/A'}`);
      console.error('\n   This usually means the database schema hasn\'t been created yet.');
      console.error('\n   Solutions:');
      console.error('   1. Run migrations to create the schema:');
      console.error('      npm run migration:run');
      console.error('\n   2. Or enable synchronize temporarily (NOT recommended for production):');
      console.error('      Add to .env: DATABASE_SYNCHRONIZE=true');
      console.error('      Then run the seeder again');
      console.error('\n   3. Manually create tables using migrations:');
      console.error(`      npx typeorm migration:run -d path/to/data-source`);
      console.error('\n   ⚠️  Note: synchronize=true is dangerous in production as it can');
      console.error('      drop and recreate tables. Use migrations instead.');
      
    } else if (error.code === '3D000' || error.message?.includes('database') || error.message?.toLowerCase().includes('database does not exist')) {
      const dbName = process.env.DATABASE_NAME || 'homemadefood_db';
      console.error('\n🔍 Database Connection Issue:');
      console.error(`   Database name: "${dbName}"`);
      console.error(`   Error code: ${error.code || 'N/A'}`);
      
      // Check if it's actually a permission issue
      if (error.message?.includes('permission denied') || error.code === '42501') {
        console.error('\n   This appears to be a permission issue.');
        console.error('   The database exists, but the user might not have permission to access it.');
        console.error(`\n   Solutions:`);
        console.error(`   1. Grant permissions:`);
        console.error(`      psql -U postgres -h ${process.env.DATABASE_HOST || 'localhost'} -c "GRANT ALL PRIVILEGES ON DATABASE ${dbName} TO ${process.env.DATABASE_USERNAME || 'postgres'};"`);
        console.error(`   2. Check if you're using the correct username/password`);
      } else {
        console.error('\n   Possible causes:');
        console.error('   1. Database name mismatch (check case sensitivity)');
        console.error('   2. Database doesn\'t exist (verify with: psql -U postgres -l)');
        console.error('   3. Connection string issue');
        console.error('   4. Wrong host or port');
        console.error('\n   Verify the database exists:');
        console.error(`      psql -U ${process.env.DATABASE_USERNAME || 'postgres'} -h ${process.env.DATABASE_HOST || 'localhost'} -l | grep ${dbName}`);
        console.error('\n   Create the database if it doesn\'t exist:');
        console.error(`      PGPASSWORD='your-password' psql -U ${process.env.DATABASE_USERNAME || 'postgres'} -h ${process.env.DATABASE_HOST || 'localhost'} -c "CREATE DATABASE ${dbName};"`);
      }
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