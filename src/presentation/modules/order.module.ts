import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OrderService } from '../../application/use-cases/order.service';
import { OrderItem } from '../../infrastructure/database/entities/order-item.entity';
import { Order } from '../../infrastructure/database/entities/order.entity';
import { OrderController } from '../controllers/order.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, OrderItem])
  ],
  controllers: [OrderController],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}