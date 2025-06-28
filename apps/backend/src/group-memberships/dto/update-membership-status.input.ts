import { InputType, Field } from '@nestjs/graphql';
import { InvitationStatus, IUpdateMembershipStatus } from '@motorove/shared';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class UpdateMembershipStatusInput
  extends BaseGroupMembershipInput
  implements IUpdateMembershipStatus
{
  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
