import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty, IsString } from 'class-validator';
import { GraphQLJSONObject } from 'graphql-type-json';
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

  @Field(() => GraphQLJSONObject)
  deviceInfo: Record<string, any>;
}
