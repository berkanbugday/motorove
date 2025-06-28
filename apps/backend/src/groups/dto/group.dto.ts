import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { IGroup } from '@motorove/shared';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

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

  @Field(() => String)
  city: string;

  @Field(() => GroupPrivacy)
  privacy: GroupPrivacy;

  @Field(() => [String])
  @IsArray()
  tags: string[];

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

  @Field(() => Date)
  createdAt: Date;
}
