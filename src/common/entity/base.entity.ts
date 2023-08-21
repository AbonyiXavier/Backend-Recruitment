import { Field, ObjectType, ID } from '@nestjs/graphql';

@ObjectType({ isAbstract: true })
export abstract class Base {
  @Field(() => ID)
  id: string;

  @Field({ description: 'Date and time when object was created.' })
  createdAt: Date;

  @Field({
    description: 'Date and time when the object was updated last time.',
  })
  updatedAt: Date;
}
