import { Args, Query, Resolver } from '@nestjs/graphql';
import { Customer } from 'src/domain/customer/entities/customer.entity';
import { CustomerService } from '../../../../services/customer.service';

@Resolver(() => Customer)
export class CustomerMutationResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [Customer])
  async updateCustomers() {
    return;
  }
}
