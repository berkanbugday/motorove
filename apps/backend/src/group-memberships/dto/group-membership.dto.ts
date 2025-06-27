import { Field, ObjectType, ID } from '@nestjs/graphql';
import { Type } from 'class-transformer';
import { IsDate, IsString, IsUUID, ValidateNested } from 'class-validator';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';
import { UserDto } from '../../users/dto/user.dto';
import { GroupDto } from '../../groups/dto/group.dto';

@ObjectType()
export class GroupMembershipDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => GroupDto, { nullable: true })
  @ValidateNested()
  @Type(() => GroupDto)
  group?: GroupDto;

  @Field(() => UserDto, { nullable: true })
  @ValidateNested()
  @Type(() => UserDto)
  user?: UserDto;

  @Field(() => GroupMemberRole)
  @IsString()
  role: GroupMemberRole;

  @Field(() => InvitationStatus)
  @IsString()
  status: InvitationStatus;

  @Field()
  @IsDate()
  joinedAt: Date;
}
