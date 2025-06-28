import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { GroupMemberRole, GroupPrivacy, IFilterGroup } from '@motorove/shared';

@InputType()
export class FilterGroupInput implements IFilterGroup {
  @Field(() => String, { nullable: true })
  @IsOptional()
  cityId?: string;

  @Field(() => GroupPrivacy, { nullable: true, defaultValue: GroupPrivacy.ALL })
  @IsOptional()
  @IsEnum(GroupPrivacy)
  privacy?: GroupPrivacy = GroupPrivacy.ALL;

  @Field(() => [String], { defaultValue: [] })
  @IsOptional()
  tags?: string[] = [];

  @Field(() => GroupMemberRole, {
    nullable: true,
    defaultValue: GroupMemberRole.ALL,
  })
  @IsOptional()
  @IsEnum(GroupMemberRole)
  role?: GroupMemberRole = GroupMemberRole.ALL;
}
