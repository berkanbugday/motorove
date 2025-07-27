import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { IGroup } from '@motorove/shared';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { CityDto } from '../../cities/dto/city.dto';
import { Type } from 'class-transformer';
import { GroupTag } from '../../enums/models/group-tag.enum';
import { GroupMembershipDto } from 'src/group-memberships/dto/group-membership.dto';

@ObjectType()
export class GroupDto implements IGroup {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  name: string;

  @Field(() => String)
  @IsString()
  description: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  logo: string | null;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  cover: string | null;

  @Field(() => CityDto)
  @ValidateNested()
  @Type(() => CityDto)
  city: CityDto;

  @Field(() => GroupPrivacy)
  privacy: GroupPrivacy;

  @Field(() => [String])
  @IsArray()
  @IsEnum(GroupTag, { each: true })
  tags: GroupTag[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  membersCapacity: number | null;

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  membersCount: number | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isMember?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isPendingMember?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isOwner?: boolean;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => [GroupMembershipDto], { nullable: true })
  @ValidateNested()
  @Type(() => GroupMembershipDto)
  memberships?: GroupMembershipDto[];
}
