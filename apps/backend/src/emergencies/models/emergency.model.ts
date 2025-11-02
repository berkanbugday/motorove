import { ObjectType, Field } from '@nestjs/graphql';
import { EmergencyType } from '../../enums/models/emergency-type.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { EmergencyDescription } from './emergency-description.model';
import { EmergencyAddress } from './emergency-address.model';
import { BaseModel } from '../../core/models';

@ObjectType()
export class Emergency extends BaseModel {
  @Field(() => EmergencyType)
  type: EmergencyType;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [EmergencyDescription])
  descriptions: EmergencyDescription[];

  @Field(() => [EmergencyAddress])
  addresses: EmergencyAddress[];
}
