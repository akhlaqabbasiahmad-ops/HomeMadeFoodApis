import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthService } from '../../application/use-cases/auth.service';
import { USER_REPOSITORY } from '../../domain/repositories/tokens';
import { JwtStrategy } from '../../infrastructure/auth/strategies/jwt.strategy';
import { LocalStrategy } from '../../infrastructure/auth/strategies/local.strategy';
import { AddressEntity } from '../../infrastructure/database/entities/address.entity';
import { UserEntity } from '../../infrastructure/database/entities/user.entity';
import { UserRepository } from '../../infrastructure/repositories/user.repository';
import { AuthController } from '../controllers/auth.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([UserEntity, AddressEntity]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    JwtModule.registerAsync({
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET'),
        signOptions: {
          expiresIn: configService.get<string>('JWT_EXPIRATION', '15m'),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    LocalStrategy,
    {
      provide: USER_REPOSITORY,
      useClass: UserRepository,
    },
  ],
  exports: [AuthService, JwtStrategy],
})
export class AuthModule {}