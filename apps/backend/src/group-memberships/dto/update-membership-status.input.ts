import { InputType, Field } from '@nestjs/graphql';
import { GroupMembershipStatus } from '../../enums/models/group-membership-status.enum';

@InputType()
export class UpdateMembershipStatusInput {
  @Field()
  groupId: string;

  @Field()
  memberId: string;

  @Field(() => GroupMembershipStatus)
  status: GroupMembershipStatus;
}
