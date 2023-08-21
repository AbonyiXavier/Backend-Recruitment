import { InputType, Field } from '@nestjs/graphql';
import { Role } from '@prisma/client';
import {
  IsAlphanumeric,
  IsBoolean,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';

@InputType()
export class SignUpInput {
  @Field()
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @Field()
  @IsAlphanumeric()
  @IsNotEmpty()
  password: string;

  @Field({ nullable: true })
  @IsString()
  @IsEnum(Role)
  @IsOptional()
  role?: Role;

  @Field({ nullable: true, defaultValue: false })
  @IsBoolean()
  @IsOptional()
  emailConfirm?: boolean;
}
