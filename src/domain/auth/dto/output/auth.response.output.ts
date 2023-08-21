import { Field, ID, ObjectType } from '@nestjs/graphql';
import { Role } from '@prisma/client';

@ObjectType()
export class ICustomer {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => Role)
  role?: Role;

  @Field(() => Number)
  code?: number;

  @Field(() => Boolean)
  emailConfirm?: boolean;
}

@ObjectType()
export class AuthResponseOutput {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;

  @Field(() => ICustomer)
  customer: ICustomer;
}
