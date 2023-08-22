import { Args, Query, Resolver } from '@nestjs/graphql';
import { Customer } from 'src/domain/customer/entities/customer.entity';
import { CustomerService } from '../../../../services/customer.service';
import { CustomersResponseOutput } from '../../../../dto/output/customers.response.output';
import { PaginationArgs } from '../../../../../../common/pagination/paginationArgs';
import { CustomerSearchByInput } from '../../../../dto/input/customer-search.input';
import { CurrentCustomerId } from '../../../../../../common/decorators/currentCustomerId.decorator';

@Resolver(() => Customer)
export class CustomerQueryResolver {
  constructor(private readonly customerService: CustomerService) {}
  @Query(() => CustomersResponseOutput, {
    name: 'customers',
    description: 'Fetch list of customers',
  })
  async customers(
    @Args({ name: 'paginationArgs', description: 'Pagination input' })
    paginationArgs: PaginationArgs,
    @Args({ name: 'searchBy', description: 'search input', nullable: true })
    searchBy: CustomerSearchByInput,
  ) {
    const [customers, error] = await this.customerService.fetchCustomers(
      paginationArgs,
      searchBy,
    );

    if (error) {
      throw error;
    }

    return customers;
  }

  @Query(() => Customer, {
    name: 'customer',
    description: 'Fetch a customer',
  })
  async customer(@CurrentCustomerId() customerId: string) {
    const [customer, error] = await this.customerService.customerById(
      customerId,
    );

    if (error) {
      throw error;
    }

    return customer;
  }
}
