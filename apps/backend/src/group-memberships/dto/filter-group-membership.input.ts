import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { IFilterGroupMembership } from '@motorove/shared';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';
import { InvitationStatus } from '../../enums/models/invitation-status.enum';

@InputType()
export class FilterGroupMembershipInput implements IFilterGroupMembership {
  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  groupId?: string;

  @Field(() => String, { nullable: true })
  @IsUUID()
  @IsOptional()
  userId?: string;

  @Field(() => GroupMemberRole, { nullable: true })
  @IsString()
  @IsOptional()
  role?: GroupMemberRole;

  @Field(() => InvitationStatus, { nullable: true })
  @IsString()
  @IsOptional()
  status?: InvitationStatus;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  isActive?: boolean;
}
