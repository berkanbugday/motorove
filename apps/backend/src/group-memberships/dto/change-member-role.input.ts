import { InputType, Field, registerEnumType } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty, IsEnum } from 'class-validator';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';

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
  userId: string;

  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  @IsNotEmpty()
  role: GroupMemberRole;
}
