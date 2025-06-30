import { InputType, Field } from '@nestjs/graphql';
import { IsEnum, IsNotEmpty } from 'class-validator';
import { IChangeMemberRole } from '@motorove/shared';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
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
