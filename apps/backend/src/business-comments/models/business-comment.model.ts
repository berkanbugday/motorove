import { Field, ObjectType, Int } from '@nestjs/graphql';
import { Business } from '../../businesses/models/business.model';
import { BaseModel } from '../../core/models/base.model';

@ObjectType()
export class BusinessComment extends BaseModel {
  @Field()
  content: string;

  @Field(() => Int)
  rating: number;

  @Field(() => Business)
  business: Partial<Business>;

  @Field()
  businessId: string;
}
