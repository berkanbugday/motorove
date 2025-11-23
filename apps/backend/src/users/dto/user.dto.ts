import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  IsEmail,
  IsOptional,
  ValidateNested,
  IsString,
  IsUUID,
  IsEnum,
  IsBoolean,
} from 'class-validator';
import { IUser } from '@motorove/shared';
import { CityDto } from 'src/cities/dto/city.dto';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { UserSettingDto } from '../../user-settings/dto/user-setting.dto';

@ObjectType()
export class UserDto implements IUser {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsString()
  firstName: string;

  @Field(() => String)
  @IsString()
  lastName: string;

  @Field(() => String)
  @IsEmail()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => Boolean, { nullable: true })
  @IsOptional()
  @IsBoolean()
  hasCompletedSetup?: boolean;

  @Field(() => String)
  @IsString()
  supabaseId: string;

  @Field(() => ApprovalStatus, { nullable: true })
  @IsEnum(ApprovalStatus)
  followingStatus?: ApprovalStatus;

  @Field(() => CityDto, { nullable: true })
  @ValidateNested()
  @Type(() => CityDto)
  city?: CityDto;

  @Field(() => UserSettingDto, { nullable: true })
  @IsOptional()
  @ValidateNested()
  @Type(() => UserSettingDto)
  userSetting?: UserSettingDto;
}
