import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsDate, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { IGroupMembership } from '@motorove/shared';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { UserDto } from '../../users/dto/user.dto';
import { Type } from 'class-transformer';

@ObjectType()
export class GroupMembershipDto implements IGroupMembership {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => ID)
  @IsUUID()
  groupId: string;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  role: GroupMemberRole;

  @Field(() => InvitationStatus)
  @IsEnum(InvitationStatus)
  status: InvitationStatus;

  @Field()
  @IsDate()
  joinedAt: Date;
}
