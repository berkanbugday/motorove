import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { GraphQLJSON } from 'graphql-type-json';
import { SupportCategory } from '../../enums/models/support-category.enum';
import { ICreateSupportRequest } from '@motorove/shared';

@InputType()
export class CreateSupportRequestInput implements ICreateSupportRequest {
  @Field(() => SupportCategory)
  @IsEnum(SupportCategory)
  @IsNotEmpty()
  category: SupportCategory;

  @Field()
  @IsString()
  @IsNotEmpty()
  subject: string;

  @Field()
  @IsString()
  @IsNotEmpty()
  message: string;

  @Field(() => GraphQLJSON, { nullable: true })
  @IsOptional()
  deviceInfo?: Record<string, string>;
}
