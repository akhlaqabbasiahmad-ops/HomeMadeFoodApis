import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateBookingTables1731300000000 implements MigrationInterface {
  name = 'CreateBookingTables1731300000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create bookings table
    await queryRunner.query(`
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

    // Create booking_service_items table
    await queryRunner.query(`
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

    // Create index on bookingId for faster lookups
    await queryRunner.query(`
      CREATE INDEX "IDX_booking_service_items_bookingId" ON "booking_service_items" ("bookingId")
    `);

    // Create index on date for faster filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_date" ON "bookings" ("date")
    `);

    // Create index on phone for faster filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_phone" ON "bookings" ("phone")
    `);

    // Create index on status for faster filtering
    await queryRunner.query(`
      CREATE INDEX "IDX_bookings_status" ON "bookings" ("status")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_phone"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_bookings_date"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_booking_service_items_bookingId"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE IF EXISTS "booking_service_items"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bookings"`);
  }
}

