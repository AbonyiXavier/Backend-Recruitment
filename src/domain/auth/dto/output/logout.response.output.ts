import { Field, ObjectType } from '@nestjs/graphql';

@ObjectType()
export class LogoutResponseOutput {
  @Field()
  loggedOut: boolean;
}
