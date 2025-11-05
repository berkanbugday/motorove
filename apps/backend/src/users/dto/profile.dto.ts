import { ObjectType, Field, ID } from '@nestjs/graphql';
import {
  IsString,
  IsUUID,
  IsOptional,
  ValidateNested,
  IsArray,
  IsEnum,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CityDto } from 'src/cities/dto/city.dto';
import { RidingStyle } from '../../enums/models/riding-style.enum';
import { Interest } from '../../enums/models/interest.enum';
import { Gender } from '../../enums/models/gender.enum';
import { UserSocialMediaProfileDto } from './user-social-media-profile.dto';

@ObjectType()
export class ProfileDto {
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
  @IsString()
  email: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => Date, { nullable: true })
  @IsOptional()
  @Type(() => Date)
  dateOfBirth?: Date;

  @Field(() => CityDto, { nullable: true })
  @ValidateNested()
  @Type(() => CityDto)
  city?: CityDto;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => [RidingStyle], { nullable: true })
  @IsOptional()
  @IsArray()
  ridingStyles?: RidingStyle[];

  @Field(() => [Interest], { nullable: true })
  @IsOptional()
  @IsArray()
  interests?: Interest[];

  @Field(() => [UserSocialMediaProfileDto], { nullable: true })
  @IsOptional()
  @IsArray()
  socialMediaProfiles?: UserSocialMediaProfileDto[];
}
