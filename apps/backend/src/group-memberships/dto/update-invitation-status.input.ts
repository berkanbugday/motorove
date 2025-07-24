import { InputType, Field } from '@nestjs/graphql';
import { IUpdateInvitationStatus } from '@motorove/shared';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class UpdateInvitationStatusInput
  extends BaseGroupMembershipInput
  implements IUpdateInvitationStatus
{
  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
