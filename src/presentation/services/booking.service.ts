import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BookingEntity, BookingStatus } from '../../infrastructure/database/entities/booking.entity';
import { BookingServiceItemEntity } from '../../infrastructure/database/entities/booking-service-item.entity';
import { CreateBookingDto, GetBookingsQueryDto, UpdateBookingStatusDto, UpdateBookingDto } from '../../application/dto/booking.dto';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(BookingEntity)
    private readonly bookingRepository: Repository<BookingEntity>,
    @InjectRepository(BookingServiceItemEntity)
    private readonly bookingServiceItemRepository: Repository<BookingServiceItemEntity>,
  ) {}

  async createBooking(createBookingDto: CreateBookingDto): Promise<BookingEntity> {
    // Create booking entity
    const booking = this.bookingRepository.create({
      name: createBookingDto.name,
      phone: createBookingDto.phone,
      date: new Date(createBookingDto.date),
      time: createBookingDto.time,
      status: BookingStatus.PENDING,
      notes: createBookingDto.notes,
    });

    // Save booking first to get the ID
    const savedBooking = await this.bookingRepository.save(booking);

    // Create service items
    const serviceItems = createBookingDto.services.map(service =>
      this.bookingServiceItemRepository.create({
        bookingId: savedBooking.id,
        serviceId: service.serviceId,
        serviceName: service.serviceName,
      }),
    );

    // Save service items
    await this.bookingServiceItemRepository.save(serviceItems);

    // Reload booking with services
    return await this.bookingRepository.findOne({
      where: { id: savedBooking.id },
      relations: ['services'],
    });
  }

  async getBookings(query: GetBookingsQueryDto): Promise<{ bookings: BookingEntity[]; total: number; page: number; totalPages: number }> {
    const page = query.page || 1;
    const limit = query.limit || 10;
    const skip = (page - 1) * limit;

    // Build query
    const queryBuilder = this.bookingRepository.createQueryBuilder('booking')
      .leftJoinAndSelect('booking.services', 'services')
      .orderBy('booking.date', 'DESC')
      .addOrderBy('booking.time', 'DESC')
      .skip(skip)
      .take(limit);

    // Apply filters
    if (query.date) {
      queryBuilder.andWhere('DATE(booking.date) = :date', { date: query.date });
    }

    if (query.phone) {
      queryBuilder.andWhere('booking.phone = :phone', { phone: query.phone });
    }

    if (query.status) {
      queryBuilder.andWhere('booking.status = :status', { status: query.status });
    }

    // Get bookings and total count
    const [bookings, total] = await queryBuilder.getManyAndCount();

    return {
      bookings,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getBookingById(id: string): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    return booking;
  }

  async updateBookingStatus(id: string, updateStatusDto: UpdateBookingStatusDto): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    booking.status = updateStatusDto.status;
    await this.bookingRepository.save(booking);

    return booking;
  }

  async updateBooking(id: string, updateBookingDto: UpdateBookingDto): Promise<BookingEntity> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['services'],
    });

    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }

    // Update basic fields
    if (updateBookingDto.name !== undefined) {
      booking.name = updateBookingDto.name;
    }
    if (updateBookingDto.phone !== undefined) {
      booking.phone = updateBookingDto.phone;
    }
    if (updateBookingDto.date !== undefined) {
      booking.date = new Date(updateBookingDto.date);
    }
    if (updateBookingDto.time !== undefined) {
      booking.time = updateBookingDto.time;
    }
    if (updateBookingDto.notes !== undefined) {
      booking.notes = updateBookingDto.notes;
    }
    if (updateBookingDto.status !== undefined) {
      booking.status = updateBookingDto.status;
    }

    // Update services if provided
    if (updateBookingDto.services !== undefined) {
      // Delete existing service items
      await this.bookingServiceItemRepository.delete({ bookingId: id });

      // Create new service items
      const serviceItems = updateBookingDto.services.map(service =>
        this.bookingServiceItemRepository.create({
          bookingId: id,
          serviceId: service.serviceId,
          serviceName: service.serviceName,
        }),
      );

      // Save new service items
      await this.bookingServiceItemRepository.save(serviceItems);
    }

    // Save booking
    await this.bookingRepository.save(booking);

    // Reload booking with services
    return await this.bookingRepository.findOne({
      where: { id },
      relations: ['services'],
    });
  }
}

