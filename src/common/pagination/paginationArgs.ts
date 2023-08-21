import { Field, InputType, Int } from '@nestjs/graphql';
import { IsNumber } from 'class-validator';

@InputType()
export class PaginationArgs {
  @Field(() => Int, { defaultValue: 20 })
  @IsNumber()
  limit: number;

  @Field(() => Int, { defaultValue: 0 })
  @IsNumber()
  offset: number;
}
