import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import {
  IsArray,
  IsBoolean,
  IsDate,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CityDto } from '../../cities/dto/city.dto';
import { UserDto } from '../../users/dto/user.dto';
import { GroupTagDto } from '../../group-tags/dto/group-tag.dto';

@ObjectType()
export class GroupDto {
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

  @Field(() => [GroupTagDto])
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => GroupTagDto)
  tags: GroupTagDto[];

  @Field(() => Int, { nullable: true })
  @IsOptional()
  @IsNumber()
  membersCapacity: number | null;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isMember?: boolean;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  isAdmin?: boolean;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: UserDto;

  @Field()
  @IsUUID()
  createdById: string;

  @Field()
  @IsDate()
  createdAt: Date;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  updatedBy: UserDto;

  @Field()
  @IsUUID()
  updatedById: string;

  @Field()
  @IsDate()
  updatedAt: Date;

  @Field()
  @IsBoolean()
  isActive: boolean;
}
