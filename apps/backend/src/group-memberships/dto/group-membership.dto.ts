import { Field, ObjectType, ID } from '@nestjs/graphql';
import { IsDate, IsEnum, IsUUID, ValidateNested } from 'class-validator';
import { IGroupMembership } from '@motorove/shared';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { UserDto } from '../../users/dto/user.dto';
import { Type } from 'class-transformer';
import { GroupDto } from '../../groups/dto/group.dto';

@ObjectType()
export class GroupMembershipDto implements IGroupMembership {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => GroupDto, { nullable: true })
  @ValidateNested()
  @Type(() => GroupDto)
  group?: GroupDto;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  user: UserDto;

  @Field(() => GroupMemberRole)
  @IsEnum(GroupMemberRole)
  role: GroupMemberRole;

  @Field(() => ApprovalStatus)
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field()
  @IsDate()
  updatedAt: Date;
}
