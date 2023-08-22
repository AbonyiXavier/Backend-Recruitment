import { InputType, Field } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@InputType()
export class UpdateCustomerInput {
  @Field({ nullable: true })
  email: string;

  @Field(() => Role, { nullable: true })
  role: Role;
}
