import { InputType, Field } from '@nestjs/graphql';
import { InvitationStatus } from '@motorove/shared';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class UpdateMembershipStatusInput extends BaseGroupMembershipInput {
  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
