import { ObjectType, Field, ID, Int } from '@nestjs/graphql';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  ValidateNested,
  IsString,
  IsUUID,
  IsEnum,
} from 'class-validator';
import { IUser } from '@motorove/shared';
import { CityDto } from 'src/cities/dto/city.dto';
import { Type } from 'class-transformer';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';

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
}
