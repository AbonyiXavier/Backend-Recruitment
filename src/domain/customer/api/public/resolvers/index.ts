import { CustomerMutationResolver } from './mutations/customer.resolver';
import { CustomerQueryResolver } from './queries/customer.resolver';

export const PublicCustomerResolvers = [
  CustomerMutationResolver,
  CustomerQueryResolver,
];
