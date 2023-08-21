import { Module } from '@nestjs/common';
import { CustomerService } from './services/customer.service';
import { PrismaService } from 'src/prisma.service';
import { PublicCustomerResolvers } from './api/public/resolvers';

@Module({
  imports: [],
  controllers: [],
  providers: [...PublicCustomerResolvers, CustomerService, PrismaService],
})
export class CustomerModule {}
