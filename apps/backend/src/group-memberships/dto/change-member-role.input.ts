import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { GroupMemberRole, IChangeMemberRole } from '@motorove/shared';
import { BaseGroupMembershipInput } from './base-group-membership.input';

@InputType()
export class ChangeMemberRoleInput
  extends BaseGroupMembershipInput
  implements IChangeMemberRole
{
  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: GroupMemberRole;
}
