import * as path from 'path';
import { DataSource } from 'typeorm';
import { DatabaseSeeder } from '../src/infrastructure/database/seeds/database-seeder';

// Create a direct database configuration for the seeder
const databaseConfig = {
  type: 'sqlite' as const,
  database: path.join(__dirname, '../data/homemadefood.sqlite'),
  entities: [path.join(__dirname, '../src/infrastructure/database/entities/*.ts')],
  synchronize: true,
  logging: true,
};

async function runSeeder() {
  console.log('🚀 Starting database seeding process...');
  
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