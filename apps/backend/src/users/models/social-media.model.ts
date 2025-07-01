import { Field, ObjectType } from '@nestjs/graphql';
import { BaseModel } from '../../core/models/base.model';
import { SocialMediaPlatform } from '../../enums/models/social-media-platform.enum';

@ObjectType()
export class SocialMedia extends BaseModel {
  @Field(() => SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @Field(() => String)
  username: string;

  @Field(() => String)
  url: string;
}
