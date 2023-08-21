import { Field, ObjectType, registerEnumType } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import { Base } from 'src/common/entity/base.entity';

@ObjectType()
export class Customer extends Base {
  @Field(() => String)
  email: string;

  @Field(() => Role, { defaultValue: Role.USER })
  role?: Role;

  @Field(() => Number)
  code?: number;

  @Field(() => Boolean, { defaultValue: false })
  emailConfirm?: boolean;
}

registerEnumType(Role, {
  name: 'Role',
  description: 'Customer Role',
});
