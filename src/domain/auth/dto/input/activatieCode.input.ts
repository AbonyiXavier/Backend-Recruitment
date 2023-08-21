import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty, IsEmail, IsNumber } from 'class-validator';

@InputType()
export class ActivateCodeInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsNumber()
  @IsNotEmpty()
  code: number;
}
