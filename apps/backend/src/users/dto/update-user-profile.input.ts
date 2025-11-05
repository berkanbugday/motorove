import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsArray, IsUUID, IsEnum } from 'class-validator';
import { RidingStyle } from '../../enums/models/riding-style.enum';
import { Interest } from '../../enums/models/interest.enum';
import { Gender } from '../../enums/models/gender.enum';
import { InsertUserSocialMediaProfileInput } from './insert-user-social-media-profile.input';

@InputType()
export class UpdateUserProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  firstName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  lastName?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  bio?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  avatar?: string;

  @Field(() => Gender, { nullable: true })
  @IsOptional()
  @IsEnum(Gender)
  gender?: Gender;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  dateOfBirth?: string;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsUUID()
  cityId?: string;

  @Field(() => [RidingStyle], { nullable: true })
  @IsOptional()
  @IsArray()
  ridingStyles?: RidingStyle[];

  @Field(() => [Interest], { nullable: true })
  @IsOptional()
  @IsArray()
  interests?: Interest[];

  @Field(() => [InsertUserSocialMediaProfileInput], { nullable: true })
  @IsOptional()
  @IsArray()
  socialMediaProfiles?: InsertUserSocialMediaProfileInput[];
}
