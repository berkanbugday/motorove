import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsOptional, IsEnum } from 'class-validator';
import { SocialMediaPlatform } from '../../enums/models/social-media-platform.enum';

@InputType()
export class InsertUserSocialMediaProfileInput {
  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  id?: string;

  @Field(() => SocialMediaPlatform)
  @IsEnum(SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @Field(() => String)
  @IsString()
  username: string;
}
