import {
  ForbiddenException,
  HttpException,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/prisma.service';
import { Customer } from '../entities/customer.entity';
import { Prisma } from '@prisma/client';
import { PaginationArgs } from '../../../common/pagination/paginationArgs';
import { CustomerSearchByInput } from '../dto/input/customer-search.input';
import { CustomersResponseOutput } from '../dto/output/customers.response.output';
import { CustomerConfig } from '../types/customer.types';
import { UpdateCustomerInput } from '../dto/input/update-customer.input';
import { mapSearchTermToRole } from '../utils';

@Injectable()
export class CustomerService {
  private readonly logger = new Logger(CustomerService.name);
  constructor(private prisma: PrismaService) {}

  async fetchCustomers(
    paginationArgs: PaginationArgs,
    searchBy: CustomerSearchByInput,
  ): Promise<[CustomersResponseOutput, HttpException]> {
    try {
      const { limit, offset } = paginationArgs;
      const { searchTerm } = searchBy;

      let where: Prisma.CustomerWhereInput = {};

      where = this.searchQuery(searchTerm, where);

      const { calculatedOffset, count } = await this.getPaginationMetadata(
        where,
        offset,
        limit,
      );

      const customers = await this.prisma.customer.findMany({
        take: limit,
        skip: calculatedOffset,
        where,
        orderBy: {
          createdAt: 'desc',
        },
      });

      const totalPages = Math.ceil(count / limit);
      const nextPage = offset + limit < count;
      const currentPage = Math.floor(offset / limit) + 1;

      const result = {
        totalCount: count,
        totalPages,
        nextPage,
        currentPage,
        customers,
      };

      return [result, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  private searchQuery(searchTerm: string, where: Prisma.CustomerWhereInput) {
    if (searchTerm) {
      const roleValue = mapSearchTermToRole(searchTerm);
      where = {
        OR: [
          { id: { contains: searchTerm, mode: 'insensitive' } },
          { email: { contains: searchTerm, mode: 'insensitive' } },
          { role: { equals: roleValue } },
        ],
      };
    }
    return where;
  }

  async customerById(customerId: string): Promise<[Customer, HttpException]> {
    try {
      const customer = await this.prisma.customer.findUnique({
        where: {
          id: customerId,
        },
      });

      if (!customer) {
        throw new NotFoundException('Customer not found');
      }

      return [customer, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  async updateCustomer(
    customerId: string,
    updateCustomerInput: UpdateCustomerInput,
  ): Promise<[Customer, HttpException]> {
    try {
      const { email, role } = updateCustomerInput;

      await this.prisma.customer.update({
        where: {
          id: customerId,
        },
        data: {
          email,
          role,
        },
      });

      const [response] = await this.customerById(customerId);

      return [response, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  async softDeleteCustomerById(
    customerId: string,
  ): Promise<[Customer, HttpException]> {
    try {
      const [customer, error] = await this.customerById(customerId);

      if (error) {
        throw error;
      }

      await this.prisma.customer.delete({
        where: {
          id: customerId,
        },
      });

      return [customer, null];
    } catch (error) {
      this.logger.error({ stack: error?.stack, message: error?.message });
      return [null, error];
    }
  }

  async getPaginationMetadata(
    where: Prisma.CustomerWhereInput,
    offset: number,
    limit: number,
  ) {
    const count = await this.prisma.customer.count({ where });

    let calculatedOffset = offset;
    if (offset === -1) {
      calculatedOffset = Math.max(count - limit, 0);
    }
    return { calculatedOffset, count };
  }

  async getCustomerByIdAndValidateOwnership(
    customerId: string,
  ): Promise<CustomerConfig> {
    const customer = await this.prisma.customer.findUnique({
      where: {
        id: customerId,
      },
    });

    if (!customer || customer.id !== customerId) {
      throw new ForbiddenException('Wrong password combination');
    }

    return customer;
  }
}
