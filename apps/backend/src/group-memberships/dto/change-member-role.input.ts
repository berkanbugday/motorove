import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { BaseGroupMembershipInput } from './base-group-membership.input';

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'The role of a user in a group',
});

@InputType()
export class ChangeMemberRoleInput extends BaseGroupMembershipInput {
  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: GroupMemberRole;
}
