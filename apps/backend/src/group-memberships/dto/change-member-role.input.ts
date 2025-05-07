import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { GroupMemberRole } from 'generated/prisma';

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'The role of a user in a group',
});

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
