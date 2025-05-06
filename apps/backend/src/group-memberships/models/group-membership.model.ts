import { ObjectType, Field } from '@nestjs/graphql';
import { GroupMemberRole } from './group-member-role.enum';
import { Group } from '../../groups/models/group.model';
import { User } from '../../auth/models/user.model';
import { BaseModel } from '../../core/models';

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

  @Field()
  joinedAt: Date;
}
