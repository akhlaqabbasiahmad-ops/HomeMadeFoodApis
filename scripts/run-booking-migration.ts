import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as path from 'path';
import { BookingEntity } from '../src/infrastructure/database/entities/booking.entity';
import { BookingServiceItemEntity } from '../src/infrastructure/database/entities/booking-service-item.entity';

// Create a minimal data source just for running the booking migration
const dataSource = new DataSource({
  type: 'postgres',
  host: process.env.DATABASE_HOST || 'localhost',
  port: parseInt(process.env.DATABASE_PORT || '5432', 10),
  username: process.env.DATABASE_USERNAME || 'postgres',
  password: process.env.DATABASE_PASSWORD || '',
  database: process.env.DATABASE_NAME || 'homemadefood_db',
  entities: [BookingEntity, BookingServiceItemEntity],
  migrations: [path.join(__dirname, '../src/infrastructure/database/migrations/1731300000000-CreateBookingTables.ts')],
  synchronize: false,
  logging: true,
});

async function runBookingMigration() {
  try {
    console.log('🔄 Connecting to database...');
    await dataSource.initialize();
    console.log('✅ Database connected');

    // Check if bookings table already exists
    const queryRunner = dataSource.createQueryRunner();
    const bookingsTableExists = await queryRunner.hasTable('bookings');
    
    if (bookingsTableExists) {
      console.log('ℹ️  Bookings table already exists. Skipping migration.');
      await dataSource.destroy();
      process.exit(0);
    }

    console.log('🔄 Running booking migration...');
    const migrations = await dataSource.runMigrations();
    
    if (migrations.length === 0) {
      console.log('ℹ️  No pending migrations found');
    } else {
      console.log(`✅ Successfully ran ${migrations.length} migration(s):`);
      migrations.forEach((migration) => {
        console.log(`   - ${migration.name}`);
      });
    }

    await dataSource.destroy();
    console.log('✅ Migration process completed');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

runBookingMigration();

