import { Field, ObjectType } from '@nestjs/graphql';
import { Base } from 'src/common/entity/base.entity';

@ObjectType()
export class Customer extends Base {
  @Field(() => String)
  email: string;
}
