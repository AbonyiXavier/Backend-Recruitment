import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class NewTokenResponseOutput {
  @Field()
  accessToken: string;

  @Field()
  refreshToken: string;
}
