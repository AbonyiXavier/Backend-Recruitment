import { Args, Mutation, Resolver } from '@nestjs/graphql';
import { Customer } from 'src/domain/customer/entities/customer.entity';
import { CustomerService } from '../../../../services/customer.service';
import { UpdateCustomerInput } from '../../../../dto/input/update-customer.input';
import { Role } from '@prisma/client';
import { Roles } from '../../../../../../common/decorators/roles.decorator';

@Resolver(() => Customer)
export class CustomerMutationResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Roles(Role.ADMIN)
  @Mutation(() => Customer, {
    name: 'updateCustomer',
    description: 'Update a customer',
  })
  async updateCustomers(
    @Args('id') id: string,
    @Args('input') input: UpdateCustomerInput,
  ) {
    const [customer, error] = await this.customerService.updateCustomer(
      id,
      input,
    );

    if (error) {
      throw error;
    }

    return customer;
  }

  @Roles(Role.ADMIN)
  @Mutation(() => Customer, {
    name: 'deleteCustomer',
    description: 'Delete a customer',
  })
  async deletePost(@Args('id') id: string) {
    const [customer, error] = await this.customerService.softDeleteCustomerById(
      id,
    );

    if (error) {
      throw error;
    }

    return customer;
  }
}
