import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as pg from 'pg';

async function createBookingTables() {
  const client = new pg.Client({
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT || '5432', 10),
    user: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || '',
    database: process.env.DATABASE_NAME || 'homemadefood_db',
  });

  try {
    console.log('🔄 Connecting to database...');
    await client.connect();
    console.log('✅ Database connected');

    // Check if bookings table already exists
    const checkTable = await client.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'bookings'
      );
    `);

    if (checkTable.rows[0].exists) {
      console.log('ℹ️  Bookings table already exists. Skipping creation.');
      await client.end();
      process.exit(0);
    }

    console.log('🔄 Creating booking tables...');

    // Create bookings table
    await client.query(`
      CREATE TABLE "bookings" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "phone" character varying(20) NOT NULL,
        "date" date NOT NULL,
        "time" time NOT NULL,
        "status" character varying(20) NOT NULL DEFAULT 'pending',
        "notes" text,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bookings" PRIMARY KEY ("id")
      )
    `);
    console.log('✅ Created bookings table');

    // Create booking_service_items table
    await client.query(`
      CREATE TABLE "booking_service_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "bookingId" uuid NOT NULL,
        "serviceId" character varying(100) NOT NULL,
        "serviceName" character varying(200) NOT NULL,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_booking_service_items" PRIMARY KEY ("id"),
        CONSTRAINT "FK_booking_service_items_booking" FOREIGN KEY ("bookingId") 
          REFERENCES "bookings"("id") ON DELETE CASCADE ON UPDATE NO ACTION
      )
    `);
    console.log('✅ Created booking_service_items table');

    // Create indexes
    await client.query(`
      CREATE INDEX "IDX_booking_service_items_bookingId" ON "booking_service_items" ("bookingId")
    `);
    console.log('✅ Created index on booking_service_items.bookingId');

    await client.query(`
      CREATE INDEX "IDX_bookings_date" ON "bookings" ("date")
    `);
    console.log('✅ Created index on bookings.date');

    await client.query(`
      CREATE INDEX "IDX_bookings_phone" ON "bookings" ("phone")
    `);
    console.log('✅ Created index on bookings.phone');

    await client.query(`
      CREATE INDEX "IDX_bookings_status" ON "bookings" ("status")
    `);
    console.log('✅ Created index on bookings.status');

    await client.end();
    console.log('✅ All booking tables created successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Failed to create booking tables:', error);
    await client.end();
    process.exit(1);
  }
}

createBookingTables();

