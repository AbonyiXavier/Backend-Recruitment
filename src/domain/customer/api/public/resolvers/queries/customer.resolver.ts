import { Args, Query, Resolver } from '@nestjs/graphql';
import { Customer } from 'src/domain/customer/entities/customer.entity';
import { CustomerService } from '../../../../services/customer.service';
import { GetCustomerInput } from '../../../../dto/customer.input';

@Resolver(() => Customer)
export class CustomerQueryResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => [Customer])
  async customers(@Args('data') { skip, take, where }: GetCustomerInput) {
    return this.customerService.findAll({ skip, take, where });
  }
}
