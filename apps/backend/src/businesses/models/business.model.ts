import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BusinessCategory } from '../../enums/models/business-category.enum';
import { BusinessDescription } from './business-description.model';
import { WorkingHour } from './working-hour.model';
import { Address } from '../../addresses/models/address.model';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { BusinessComment } from 'src/business-comments/models/business-comment.model';

@ObjectType()
export class Business {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => BusinessCategory)
  category: BusinessCategory;

  @Field(() => String)
  phoneNumber: string;

  @Field(() => Boolean)
  verified: boolean;

  @Field(() => Address)
  address: Address;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [BusinessDescription])
  descriptions: BusinessDescription[];

  @Field(() => [WorkingHour])
  workingHours: WorkingHour[];

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [BusinessComment])
  comments: BusinessComment[];
}
