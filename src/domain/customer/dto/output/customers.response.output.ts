import { Field, ObjectType } from '@nestjs/graphql';
import { Customer } from '../../entities/customer.entity';

@ObjectType()
export class CustomersResponseOutput {
  @Field(() => Number, {
    name: 'totalCount',
    description: 'Total Count of results',
    defaultValue: 0,
  })
  totalCount: number;

  @Field(() => Number, {
    name: 'totalPages',
    description: 'Total Pages of results',
    defaultValue: 0,
  })
  totalPages: number;

  @Field(() => Number, {
    name: 'currentPage',
    description: 'Current page number starting 0',
    defaultValue: 0,
  })
  currentPage: number;

  @Field({
    name: 'nextPage',
    description: 'boolean flag to indicate if more pages exists',
    defaultValue: false,
  })
  nextPage: boolean;

  @Field(() => [Customer], {
    name: 'customers',
    description: 'Array of customers output',
    defaultValue: [],
  })
  customers: Customer[];
}
