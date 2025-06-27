import { InputType, Field } from '@nestjs/graphql';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class UpdateMembershipStatusInput extends BaseGroupMembershipInput {
  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
