import { Module } from '@nestjs/common';
import { AuthService } from './services/auth.service';
import { JwtService } from '@nestjs/jwt';
import { AccessTokenStrategy } from './strategies/accessToken.strategy';
import { RefreshTokenStrategy } from './strategies/refreshToken.strategy';
import { PrismaService } from '../../prisma.service';
import { PublicAuthResolvers } from './api/public/resolvers';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from '../../providers/email/email.service';
import { CustomerService } from '../customer/services/customer.service';

@Module({
  imports: [ConfigModule],
  providers: [
    ...PublicAuthResolvers,
    AuthService,
    JwtService,
    PrismaService,
    AccessTokenStrategy,
    RefreshTokenStrategy,
    EmailService,
    CustomerService,
  ],
})
export class AuthModule {}
