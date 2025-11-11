import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingEntity } from '../../infrastructure/database/entities/booking.entity';
import { BookingServiceItemEntity } from '../../infrastructure/database/entities/booking-service-item.entity';
import { BookingController } from '../controllers/booking.controller';
import { BookingService } from '../services/booking.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([BookingEntity, BookingServiceItemEntity]),
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}

