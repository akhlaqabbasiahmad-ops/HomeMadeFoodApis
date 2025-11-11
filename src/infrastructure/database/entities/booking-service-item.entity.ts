import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { BookingEntity } from './booking.entity';

@Entity('booking_service_items')
export class BookingServiceItemEntity {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  bookingId: string;

  @Column({ type: 'varchar', length: 100 })
  serviceId: string;

  @Column({ type: 'varchar', length: 200 })
  serviceName: string;

  @CreateDateColumn()
  createdAt: Date;

  @ManyToOne(() => BookingEntity, booking => booking.services, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'bookingId' })
  booking: BookingEntity;
}

