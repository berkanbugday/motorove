import { ObjectType, Field } from '@nestjs/graphql';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { Group } from '../../groups/models/group.model';
import { User } from '../../users/models/user.model';
import { BaseModel } from '../../core/models';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';

@ObjectType()
export class GroupMembership extends BaseModel {
  @Field(() => Group)
  group: Group;

  @Field()
  groupId: string;

  @Field(() => User)
  user: User;

  @Field()
  userId: string;

  @Field(() => GroupMemberRole)
  role: GroupMemberRole;

  @Field(() => ApprovalStatus)
  status: ApprovalStatus;
}
