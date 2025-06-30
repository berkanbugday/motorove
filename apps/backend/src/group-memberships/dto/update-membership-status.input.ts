import { InputType, Field } from '@nestjs/graphql';
import { IUpdateMembershipStatus } from '@motorove/shared';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class UpdateMembershipStatusInput
  extends BaseGroupMembershipInput
  implements IUpdateMembershipStatus
{
  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
