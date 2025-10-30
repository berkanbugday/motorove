import { ObjectType, Field } from '@nestjs/graphql';
import { WarningType } from '../../enums/models/warning-type.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { WarningDescription } from './warning-description.model';
import { WarningAddress } from './warning-address.model';
import { BaseModel } from '../../core/models';

@ObjectType()
export class Warning extends BaseModel {
  @Field(() => WarningType)
  type: WarningType;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [WarningDescription])
  descriptions: WarningDescription[];

  @Field(() => [WarningAddress])
  addresses: WarningAddress[];
}
