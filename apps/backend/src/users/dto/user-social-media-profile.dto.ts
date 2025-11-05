import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsString, IsUUID, IsEnum } from 'class-validator';
import { SocialMediaPlatform } from '../../enums/models/social-media-platform.enum';

@ObjectType()
export class UserSocialMediaProfileDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => SocialMediaPlatform)
  @IsEnum(SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @Field(() => String)
  @IsString()
  username: string;
}
