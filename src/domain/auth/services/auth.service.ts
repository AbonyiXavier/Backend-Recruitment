import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  Inject,
  Injectable,
  InternalServerErrorException,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as argon from 'argon2';
import { AuthResponseOutput } from '../dto/output/auth.response.output';
import { SignUpInput } from '../dto/input/signup.input';
import { SignInInput } from '../dto/input/signin.input';
import { LogoutResponseOutput } from '../dto/output/logout.response.output';
import { IAuthService } from '../interfaces/IAuth.interface';
import { Customer } from '../../customer/types/customer.types';
import { PrismaService } from '../../../prisma.service';
import { ICreateTokens } from '../types/auth.types';
import { Role } from '@prisma/client';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
  ) {}

  async signUp(
    signUpInput: SignUpInput,
  ): Promise<[AuthResponseOutput, HttpException]> {
    try {
      const { email, password, role } = signUpInput;

      await this.checkDuplicateEmail(email);

      const hashedPassword = await argon.hash(password);
      const customer = await this.prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          role: role || Role.USER,
        },
      });

      const { accessToken, refreshToken } = await this.createTokens(
        customer?.id,
        customer?.email,
        customer?.role,
      );

      await this.updateRefreshedToken(customer?.id, refreshToken);

      const response = { accessToken, refreshToken, customer };

      return [response, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  async signIn(
    signInInput: SignInInput,
  ): Promise<[AuthResponseOutput, HttpException]> {
    const { email, password } = signInInput;

    try {
      const customer = await this.validateEmailExist(email);

      const isPasswordMatch = await argon.verify(customer?.password, password);

      if (!isPasswordMatch) {
        throw new UnauthorizedException('Invalid credentials provided');
      }

      const { accessToken, refreshToken } = await this.createTokens(
        customer?.id,
        customer?.email,
        customer?.role,
      );

      await this.updateRefreshedToken(customer?.id, refreshToken);

      const response = { accessToken, refreshToken, customer };

      return [response, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  async createTokens(
    userId: string,
    email: string,
    role: string,
  ): Promise<ICreateTokens> {
    const accessToken = this.jwtService.sign(
      {
        userId,
        email,
        role,
      },
      {
        expiresIn: '2h',
        secret: this.configService.get('ACCESS_TOKEN_SECRET'),
      },
    );
    const refreshToken = this.jwtService.sign(
      {
        userId,
        email,
        role,
        accessToken,
      },
      {
        expiresIn: '7d',
        secret: this.configService.get('REFRESHED_TOKEN_SECRET'),
      },
    );

    return { accessToken, refreshToken };
  }

  async updateRefreshedToken(
    userId: string,
    refreshedToken: string,
  ): Promise<void> {
    const hashedRefreshedToken = await argon.hash(refreshedToken);
    try {
      await this.prisma.customer.update({
        where: {
          id: userId,
        },
        data: {
          refreshToken: hashedRefreshedToken,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException('Failed to update refreshedToken');
    }
  }

  async logout(userId: string): Promise<LogoutResponseOutput> {
    try {
      await this.prisma.customer.updateMany({
        where: {
          id: userId,
          refreshToken: { not: null },
        },
        data: {
          refreshToken: null,
        },
      });

      return { loggedOut: true };
    } catch (error) {
      throw new InternalServerErrorException('Failed to logout');
    }
  }

  /***
   *  Validator to check if email exists
   */
  async validateEmailExist(customerEmail: string): Promise<Customer> {
    const customer = await this.prisma.customer.findFirst({
      where: {
        email: customerEmail,
      },
    });

    if (!customer) {
      throw new BadRequestException(`User with email does not exist.`);
    }

    return customer;
  }

  async getNewTokens(
    customerId: string,
    rt: string,
  ): Promise<[AuthResponseOutput, HttpException]> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: { id: customerId },
      });

      if (!customer) {
        throw new ForbiddenException('Access Denied');
      }

      const doRefreshTokenMatch = await argon.verify(
        customer?.refreshToken,
        rt,
      );

      if (!doRefreshTokenMatch) {
        throw new ForbiddenException('Access Denied');
      }

      const { accessToken, refreshToken } = await this.createTokens(
        customer?.id,
        customer?.email,
        customer?.role,
      );

      await this.updateRefreshedToken(customer?.id, refreshToken);

      const response = { accessToken, refreshToken, customer };

      return [response, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  /***
   * Checks duplicate email
   */
  async checkDuplicateEmail(email: string): Promise<void> {
    const existingUser = await this.prisma.customer.findFirst({
      where: {
        email,
      },
    });

    if (existingUser) {
      throw new ConflictException('Email already in use.');
    }
  }
}
