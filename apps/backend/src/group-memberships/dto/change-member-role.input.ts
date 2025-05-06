import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { GroupMemberRole } from '../models/group-member-role.enum';

@InputType()
export class ChangeMemberRoleInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  memberId: string;

  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: GroupMemberRole;
}
