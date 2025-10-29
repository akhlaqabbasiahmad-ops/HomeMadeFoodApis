import { BadRequestException, ConflictException, Inject, Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import { User } from '../../domain/entities/user.entity';
import { AuthTokens, JwtPayload } from '../../domain/interfaces/auth.interface';
import { USER_REPOSITORY } from '../../domain/repositories/tokens';
import { IUserRepository } from '../../domain/repositories/user.repository.interface';
import { ChangePasswordDto, LoginDto, RegisterDto } from '../dto/auth.dto';

@Injectable()
export class AuthService {
  constructor(
    @Inject(USER_REPOSITORY)
    private readonly userRepository: IUserRepository,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Check if user already exists
    const existingUserByEmail = await this.userRepository.findByEmail(registerDto.email);
    if (existingUserByEmail) {
      throw new ConflictException('User with this email already exists');
    }

    const existingUserByPhone = await this.userRepository.findByPhone(registerDto.phone);
    if (existingUserByPhone) {
      throw new ConflictException('User with this phone number already exists');
    }

    // Hash password
    const saltRounds = 12;
    const hashedPassword = await bcrypt.hash(registerDto.password, saltRounds);

    // Create user
    const newUser = new User(
      uuidv4(),
      registerDto.name,
      registerDto.email,
      registerDto.phone,
      hashedPassword,
      registerDto.avatar,
      [],
      'user', // Default role for new registrations
      true,
      new Date(),
      new Date(),
    );

    const savedUser = await this.userRepository.create(newUser);
    const tokens = await this.generateTokens(savedUser);

    // Return user without password
    const userWithoutPassword = new User(
      savedUser.id,
      savedUser.name,
      savedUser.email,
      savedUser.phone,
      undefined, // Don't return password
      savedUser.avatar,
      savedUser.addresses,
      savedUser.role || 'user',
      savedUser.isActive,
      savedUser.createdAt,
      savedUser.updatedAt,
    );

    return { user: userWithoutPassword, tokens };
  }

  async login(loginDto: LoginDto): Promise<{ user: User; tokens: AuthTokens }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(loginDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Account is deactivated');
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(loginDto.password, user.password!);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user);

    // Return user without password
    const userWithoutPassword = new User(
      user.id,
      user.name,
      user.email,
      user.phone,
      undefined, // Don't return password
      user.avatar,
      user.addresses,
      user.role || 'user',
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );

    return { user: userWithoutPassword, tokens };
  }

  async refreshTokens(refreshToken: string): Promise<AuthTokens> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
      });

      const user = await this.userRepository.findById(payload.sub);
      if (!user || !user.isActive) {
        throw new UnauthorizedException('Invalid refresh token');
      }

      return this.generateTokens(user);
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateUser(payload: JwtPayload): Promise<User | null> {
    const user = await this.userRepository.findById(payload.sub);
    if (!user || !user.isActive) {
      return null;
    }

    // Return user without password
    return new User(
      user.id,
      user.name,
      user.email,
      user.phone,
      undefined, // Don't return password
      user.avatar,
      user.addresses,
      user.role || 'user',
      user.isActive,
      user.createdAt,
      user.updatedAt,
    );
  }

  async changePassword(userId: string, changePasswordDto: ChangePasswordDto): Promise<void> {
    const user = await this.userRepository.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password!,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    // Hash new password
    const saltRounds = 12;
    const hashedNewPassword = await bcrypt.hash(changePasswordDto.newPassword, saltRounds);

    // Update user with new password
    const updatedUser = new User(
      user.id,
      user.name,
      user.email,
      user.phone,
      hashedNewPassword,
      user.avatar,
      user.addresses,
      user.role || 'user',
      user.isActive,
      user.createdAt,
      new Date(),
    );

    await this.userRepository.update(user.id, updatedUser);
  }

  private async generateTokens(user: User): Promise<AuthTokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      name: user.name,
    };

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_SECRET'),
        expiresIn: this.configService.get<string>('JWT_EXPIRATION', '15m'),
      }),
      this.jwtService.signAsync(payload, {
        secret: this.configService.get<string>('JWT_REFRESH_SECRET'),
        expiresIn: this.configService.get<string>('JWT_REFRESH_EXPIRATION', '7d'),
      }),
    ]);

    return { accessToken, refreshToken };
  }
}