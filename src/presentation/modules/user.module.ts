import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { UserController } from '../controllers/user.controller';
import { AddressService } from '../services/address.service';
import { UserService } from '../services/user.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AddressEntity]),
  ],
  controllers: [UserController],
  providers: [
    UserService,
    AddressService,
  ],
  exports: [UserService, AddressService],
})
export class UserModule {}