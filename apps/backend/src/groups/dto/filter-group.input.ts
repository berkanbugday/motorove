import { Field, InputType } from '@nestjs/graphql';
import { IsEnum, IsOptional } from 'class-validator';
import { IFilterGroup } from '@motorove/shared';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import { GroupTag } from '../../enums/models/group-tag.enum';
import { GroupMemberRole } from '../../enums/models/group-member-role.enum';

@InputType()
export class FilterGroupInput implements IFilterGroup {
  @Field(() => String, { nullable: true })
  @IsOptional()
  cityId?: string;

  @Field(() => GroupPrivacy, { nullable: true, defaultValue: GroupPrivacy.ALL })
  @IsOptional()
  @IsEnum(GroupPrivacy)
  privacy?: GroupPrivacy = GroupPrivacy.ALL;

  @Field(() => [GroupTag], { defaultValue: [] })
  @IsOptional()
  tags?: GroupTag[] = [];

  @Field(() => GroupMemberRole, { nullable: true })
  @IsOptional()
  role?: GroupMemberRole;
}
