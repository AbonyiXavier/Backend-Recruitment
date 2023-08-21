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
import {
  AuthResponseOutput,
  ICustomer,
} from '../dto/output/auth.response.output';
import { SignUpInput } from '../dto/input/signup.input';
import { SignInInput } from '../dto/input/signin.input';
import { LogoutResponseOutput } from '../dto/output/logout.response.output';
import { IAuthService } from '../interfaces/IAuth.interface';
import { CustomerConfig } from '../../customer/types/customer.types';
import { PrismaService } from '../../../prisma.service';
import { ICreateTokens } from '../types/auth.types';
import { Role } from '@prisma/client';
import { EmailService } from '../../../providers/email/email.service';
import { ActivateCodeInput } from '../dto/input/activatieCode.input';
import { CustomerService } from '../../customer/services/customer.service';
import { Customer } from '../../customer/entities/customer.entity';

@Injectable()
export class AuthService implements IAuthService {
  private readonly logger = new Logger(AuthService.name);
  constructor(
    @Inject(PrismaService) private readonly prisma: PrismaService,
    @Inject(JwtService) private readonly jwtService: JwtService,
    @Inject(ConfigService) private readonly configService: ConfigService,
    @Inject(EmailService) private readonly emailService: EmailService,
    @Inject(CustomerService) private readonly customerService: CustomerService,
  ) {}

  async signUp(
    signUpInput: SignUpInput,
  ): Promise<[AuthResponseOutput, HttpException]> {
    try {
      const { email, password, role } = signUpInput;

      await this.checkDuplicateEmail(email);

      const hashedPassword = await argon.hash(password);
      const activationCode = await this.generateCustomerActivationCode();

      const customer = await this.prisma.customer.create({
        data: {
          email,
          password: hashedPassword,
          role: role || Role.USER,
          code: activationCode,
        },
      });

      const { accessToken, refreshToken } = await this.createTokens(
        customer?.id,
        customer?.email,
        customer?.role,
      );

      await this.updateRefreshedToken(customer?.id, refreshToken);

      const response = { accessToken, refreshToken, customer };

      if (customer) {
        await this.emailService.sendEmailActivationCode(
          customer?.email,
          customer?.code,
        );
      }

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

      if (!customer?.emailConfirm) {
        throw new UnauthorizedException(
          'Please activate your account before you can login',
        );
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
  async confirmActivationCode(
    props: ActivateCodeInput,
  ): Promise<[Customer, HttpException]> {
    const { email, code } = props;

    try {
      const customer = await this.prisma.customer.findFirst({
        where: {
          email,
          code,
        },
      });

      if (!customer) {
        throw new UnauthorizedException(`Account doesn't exist`);
      }

      await this.updateActivationCode(customer?.email);

      const [response] = await this.customerService.customerMe(customer?.id);

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
  async updateActivationCode(email: string): Promise<void> {
    try {
      await this.prisma.customer.update({
        where: {
          email,
        },
        data: {
          code: undefined,
          emailConfirm: true,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to update updateActivationCode',
      );
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
  async validateEmailExist(customerEmail: string): Promise<CustomerConfig> {
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

  /***
   * Generate 6-digit customer activation code
   */
  async generateCustomerActivationCode(): Promise<number> {
    let activationCode = Math.floor(100000 + Math.random() * 900000);

    const checkDuplicateCode = async () => {
      const userCodeExist = await this.prisma.customer.findFirst({
        where: {
          code: activationCode,
        },
      });

      if (userCodeExist) {
        activationCode = Math.floor(100000 + Math.random() * 900000);
      }
    };

    await checkDuplicateCode();
    return activationCode;
  }
}
