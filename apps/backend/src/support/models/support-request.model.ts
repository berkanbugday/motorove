import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../core/models/base.model';
import { SupportCategory } from '../../enums/models/support-category.enum';
import { GraphQLJSONObject } from 'graphql-type-json';

@ObjectType()
export class SupportRequest extends BaseModel {
  @Field(() => SupportCategory)
  category: SupportCategory;

  @Field()
  subject: string;

  @Field()
  message: string;

  @Field(() => GraphQLJSONObject)
  deviceInfo: Record<string, any>;
}
