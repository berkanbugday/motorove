import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID, ValidateNested } from 'class-validator';
import { IGroupMembership } from '@motorove/shared';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { UserDto } from '../../users/dto/user.dto';
import { GroupDto } from '../../groups/dto/group.dto';

@ObjectType()
export class GroupMembershipDto implements IGroupMembership {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => GroupDto)
  @ValidateNested()
  @Type(() => GroupDto)
  group: Partial<GroupDto>;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  user: Partial<UserDto>;

  @Field(() => GroupMemberRole)
  @IsString()
  role: GroupMemberRole;

  @Field()
  @IsDate()
  joinedAt: Date;
}
