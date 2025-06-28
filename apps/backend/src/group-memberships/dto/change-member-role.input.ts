import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GroupMemberRole } from '@motorove/shared';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class ChangeMemberRoleInput extends BaseGroupMembershipInput {
  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: GroupMemberRole;
}
