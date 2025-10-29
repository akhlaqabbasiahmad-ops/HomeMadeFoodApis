import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateInitialTables1701000000000 implements MigrationInterface {
  name = 'CreateInitialTables1701000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "fullName" character varying NOT NULL,
        "phoneNumber" character varying,
        "role" character varying NOT NULL DEFAULT 'customer',
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_97672ac88f789774dd47f7c8be3" UNIQUE ("email"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create addresses table
    await queryRunner.query(`
      CREATE TABLE "addresses" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "street" character varying NOT NULL,
        "city" character varying NOT NULL,
        "state" character varying NOT NULL,
        "zipCode" character varying NOT NULL,
        "country" character varying NOT NULL DEFAULT 'US',
        "isDefault" boolean NOT NULL DEFAULT false,
        "userId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_745d8f43d3af10ab8247465e450" PRIMARY KEY ("id")
      )
    `);

    // Create categories table
    await queryRunner.query(`
      CREATE TABLE "categories" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" character varying,
        "icon" character varying,
        "isActive" boolean NOT NULL DEFAULT true,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_8b0be371d28245da6e4f4b61878" UNIQUE ("name"),
        CONSTRAINT "PK_24dbc6126a28ff948da33e97d3b" PRIMARY KEY ("id")
      )
    `);

    // Create restaurants table
    await queryRunner.query(`
      CREATE TABLE "restaurants" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "address" character varying NOT NULL,
        "phoneNumber" character varying,
        "email" character varying,
        "imageUrl" character varying,
        "rating" numeric(3,2) NOT NULL DEFAULT 0,
        "isActive" boolean NOT NULL DEFAULT true,
        "deliveryFee" numeric(10,2) NOT NULL DEFAULT 0,
        "minimumOrder" numeric(10,2) NOT NULL DEFAULT 0,
        "ownerId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_e2133a72eb1cc8f588f7b503e68" PRIMARY KEY ("id")
      )
    `);

    // Create food_items table
    await queryRunner.query(`
      CREATE TABLE "food_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying NOT NULL,
        "description" text,
        "price" numeric(10,2) NOT NULL,
        "imageUrl" character varying,
        "isVegetarian" boolean NOT NULL DEFAULT false,
        "isVegan" boolean NOT NULL DEFAULT false,
        "isGlutenFree" boolean NOT NULL DEFAULT false,
        "isAvailable" boolean NOT NULL DEFAULT true,
        "preparationTime" integer NOT NULL DEFAULT 30,
        "calories" integer,
        "rating" numeric(3,2) NOT NULL DEFAULT 0,
        "reviewCount" integer NOT NULL DEFAULT 0,
        "restaurantId" uuid,
        "categoryId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_c4069f9f19c15c3fd00006d4e07" PRIMARY KEY ("id")
      )
    `);

    // Create orders table
    await queryRunner.query(`
      CREATE TABLE "orders" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "totalAmount" numeric(10,2) NOT NULL,
        "status" character varying NOT NULL DEFAULT 'pending',
        "deliveryAddress" text NOT NULL,
        "specialInstructions" text,
        "estimatedDeliveryTime" TIMESTAMP,
        "actualDeliveryTime" TIMESTAMP,
        "userId" uuid,
        "restaurantId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_710e2d4957aa5878dfe94e4ac2f" PRIMARY KEY ("id")
      )
    `);

    // Create order_items table
    await queryRunner.query(`
      CREATE TABLE "order_items" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "quantity" integer NOT NULL DEFAULT 1,
        "price" numeric(10,2) NOT NULL,
        "specialRequests" text,
        "orderId" uuid,
        "foodItemId" uuid,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_005269d8574e6fac0493715c308" PRIMARY KEY ("id")
      )
    `);

    // Add foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "addresses" 
      ADD CONSTRAINT "FK_16aac8a9f6f9c1dd6480f4d9e5e" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "restaurants" 
      ADD CONSTRAINT "FK_d0d8a8a59c8c7ec6c67d2b5fd88" 
      FOREIGN KEY ("ownerId") REFERENCES "users"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "food_items" 
      ADD CONSTRAINT "FK_f2c68bbf4e0fc7e5b1c95b9d4f0" 
      FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "food_items" 
      ADD CONSTRAINT "FK_c86a6f1c9e5e0d1e2b3b4c5d6e7" 
      FOREIGN KEY ("categoryId") REFERENCES "categories"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "orders" 
      ADD CONSTRAINT "FK_1e2b3c4d5e6f7g8h9i0j1k2l3m4" 
      FOREIGN KEY ("restaurantId") REFERENCES "restaurants"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ADD CONSTRAINT "FK_145532db32164f7312e5c50e99e" 
      FOREIGN KEY ("orderId") REFERENCES "orders"("id") 
      ON DELETE CASCADE ON UPDATE NO ACTION
    `);

    await queryRunner.query(`
      ALTER TABLE "order_items" 
      ADD CONSTRAINT "FK_b5e3b2c3d4e5f6g7h8i9j0k1l2m" 
      FOREIGN KEY ("foodItemId") REFERENCES "food_items"("id") 
      ON DELETE SET NULL ON UPDATE NO ACTION
    `);

    // Create indexes for better performance
    await queryRunner.query(`CREATE INDEX "IDX_users_email" ON "users" ("email")`);
    await queryRunner.query(`CREATE INDEX "IDX_restaurants_name" ON "restaurants" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_food_items_name" ON "food_items" ("name")`);
    await queryRunner.query(`CREATE INDEX "IDX_food_items_restaurant" ON "food_items" ("restaurantId")`);
    await queryRunner.query(`CREATE INDEX "IDX_food_items_category" ON "food_items" ("categoryId")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_user" ON "orders" ("userId")`);
    await queryRunner.query(`CREATE INDEX "IDX_orders_status" ON "orders" ("status")`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints first
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_b5e3b2c3d4e5f6g7h8i9j0k1l2m"`);
    await queryRunner.query(`ALTER TABLE "order_items" DROP CONSTRAINT "FK_145532db32164f7312e5c50e99e"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_1e2b3c4d5e6f7g8h9i0j1k2l3m4"`);
    await queryRunner.query(`ALTER TABLE "orders" DROP CONSTRAINT "FK_151b79a83ba240b0cb31b2302d1"`);
    await queryRunner.query(`ALTER TABLE "food_items" DROP CONSTRAINT "FK_c86a6f1c9e5e0d1e2b3b4c5d6e7"`);
    await queryRunner.query(`ALTER TABLE "food_items" DROP CONSTRAINT "FK_f2c68bbf4e0fc7e5b1c95b9d4f0"`);
    await queryRunner.query(`ALTER TABLE "restaurants" DROP CONSTRAINT "FK_d0d8a8a59c8c7ec6c67d2b5fd88"`);
    await queryRunner.query(`ALTER TABLE "addresses" DROP CONSTRAINT "FK_16aac8a9f6f9c1dd6480f4d9e5e"`);

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_orders_status"`);
    await queryRunner.query(`DROP INDEX "IDX_orders_user"`);
    await queryRunner.query(`DROP INDEX "IDX_food_items_category"`);
    await queryRunner.query(`DROP INDEX "IDX_food_items_restaurant"`);
    await queryRunner.query(`DROP INDEX "IDX_food_items_name"`);
    await queryRunner.query(`DROP INDEX "IDX_restaurants_name"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "order_items"`);
    await queryRunner.query(`DROP TABLE "orders"`);
    await queryRunner.query(`DROP TABLE "food_items"`);
    await queryRunner.query(`DROP TABLE "restaurants"`);
    await queryRunner.query(`DROP TABLE "categories"`);
    await queryRunner.query(`DROP TABLE "addresses"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}