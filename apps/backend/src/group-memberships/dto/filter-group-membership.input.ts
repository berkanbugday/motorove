import { Field, InputType } from '@nestjs/graphql';
import { IsOptional, IsString, IsUUID } from 'class-validator';
import { GroupMemberRole, InvitationStatus } from '@motorove/shared';

@InputType()
export class FilterGroupMembershipInput {
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
