import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../core/models/base.model';
import { SupportCategory } from '../../enums/models/support-category.enum';
import { GraphQLJSON } from 'graphql-type-json';

@ObjectType()
export class SupportRequest extends BaseModel {
  @Field(() => SupportCategory)
  category: SupportCategory;

  @Field()
  subject: string;

  @Field()
  message: string;

  @Field(() => GraphQLJSON)
  deviceInfo: Record<string, string>;
}
