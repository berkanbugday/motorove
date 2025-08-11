import { ObjectType, Field, ID } from '@nestjs/graphql';
import { BusinessCategory } from '../../enums/models/business-category.enum';
import { BusinessDescriptionDto } from '../dto/business-description.dto';
import { WorkingHourDto } from '../dto/working-hour.dto';
import { Address } from '../../addresses/models/address.model';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';

@ObjectType()
export class Business {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  name: string;

  @Field(() => BusinessCategory)
  mainCategory: BusinessCategory;

  @Field(() => [BusinessCategory])
  subCategories: BusinessCategory[];

  @Field(() => String)
  phoneNumber: string;

  @Field(() => Boolean)
  verified: boolean;

  @Field(() => Address)
  address: Address;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [BusinessDescriptionDto])
  descriptions: BusinessDescriptionDto[];

  @Field(() => [WorkingHourDto])
  workingHours: WorkingHourDto[];

  @Field(() => Boolean)
  isActive: boolean;
}
