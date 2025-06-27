import { InputType, Field } from '@nestjs/graphql';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';

@InputType()
export class UpdateMembershipStatusInput {
  @Field()
  groupId: string;

  @Field()
  userId: string;

  @Field(() => InvitationStatus)
  status: InvitationStatus;
}
