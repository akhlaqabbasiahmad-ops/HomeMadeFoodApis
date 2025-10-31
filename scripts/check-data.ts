import * as path from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import * as dotenv from 'dotenv';
import { Category } from '../src/infrastructure/database/entities/category.entity';
import { RestaurantEntity } from '../src/infrastructure/database/entities/restaurant.entity';
import { FoodItemEntity } from '../src/infrastructure/database/entities/food-item.entity';

// Load .env file
const envPaths = [
  path.join(__dirname, '../.env'),
  path.join(process.cwd(), '.env'),
];

for (const envPath of envPaths) {
  const result = dotenv.config({ path: envPath });
  if (!result.error) {
    console.log(`📄 Loaded environment variables from ${envPath}`);
    break;
  }
}

const nodeEnv = process.env.NODE_ENV || 'development';

const getDatabaseConfig = (): DataSourceOptions => {
  if (nodeEnv === 'production') {
    return {
      type: 'postgres',
      host: process.env.DATABASE_HOST || 'localhost',
      port: parseInt(process.env.DATABASE_PORT || '5432', 10),
      username: process.env.DATABASE_USERNAME || 'postgres',
      password: process.env.DATABASE_PASSWORD || '',
      database: process.env.DATABASE_NAME || 'homemadefood_db',
      entities: [Category, RestaurantEntity, FoodItemEntity],
      synchronize: false,
      logging: false,
    };
  }

  return {
    type: 'sqlite' as const,
    database: path.join(__dirname, '../data/homemadefood.sqlite'),
    entities: [Category, RestaurantEntity],
    synchronize: false,
    logging: false,
  };
};

async function checkData() {
  const dataSource = new DataSource(getDatabaseConfig());
  
  try {
    await dataSource.initialize();
    console.log('✅ Connected to database\n');

    // Check categories
    const categoryRepo = dataSource.getRepository(Category);
    const allCategories = await categoryRepo.find();
    const activeCategories = await categoryRepo.find({ where: { isActive: true } });
    
    console.log('📊 Categories:');
    console.log(`   Total: ${allCategories.length}`);
    console.log(`   Active: ${activeCategories.length}`);
    if (allCategories.length > 0) {
      console.log('   All categories:');
      allCategories.forEach(cat => {
        console.log(`     - ${cat.name} (isActive: ${cat.isActive})`);
      });
    } else {
      console.log('   ⚠️  No categories found!');
    }

    // Check restaurants
    const restaurantRepo = dataSource.getRepository(RestaurantEntity);
    const allRestaurants = await restaurantRepo.find();
    const activeRestaurants = await restaurantRepo.find({ where: { isActive: true } });
    
    console.log('\n📊 Restaurants:');
    console.log(`   Total: ${allRestaurants.length}`);
    console.log(`   Active: ${activeRestaurants.length}`);
    if (allRestaurants.length > 0) {
      console.log('   All restaurants:');
      allRestaurants.forEach(rest => {
        console.log(`     - ${rest.name} (isActive: ${rest.isActive})`);
      });
    } else {
      console.log('   ⚠️  No restaurants found!');
    }

    // Check food items
    const foodItemRepo = dataSource.getRepository(FoodItemEntity);
    const allFoodItems = await foodItemRepo.find();
    const availableFoodItems = await foodItemRepo.find({ where: { isAvailable: true } });
    const featuredFoodItems = await foodItemRepo.find({ where: { isFeatured: true } });
    const popularFoodItems = await foodItemRepo.find({ where: { isPopular: true } });
    
    console.log('\n📊 Food Items:');
    console.log(`   Total: ${allFoodItems.length}`);
    console.log(`   Available: ${availableFoodItems.length}`);
    console.log(`   Featured: ${featuredFoodItems.length}`);
    console.log(`   Popular: ${popularFoodItems.length}`);
    if (allFoodItems.length > 0) {
      console.log('   Sample food items:');
      allFoodItems.slice(0, 5).forEach(item => {
        console.log(`     - ${item.name} (Available: ${item.isAvailable}, Featured: ${item.isFeatured}, Popular: ${item.isPopular})`);
      });
      if (allFoodItems.length > 5) {
        console.log(`     ... and ${allFoodItems.length - 5} more`);
      }
    } else {
      console.log('   ⚠️  No food items found!');
    }

    await dataSource.destroy();
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

checkData();

