import { Field, ObjectType } from '@nestjs/graphql';
import { SocialMediaPlatform } from '../../enums/models/social-media-platform.enum';
import { User } from './user.model';

@ObjectType()
export class UserSocialMediaProfile {
  @Field(() => SocialMediaPlatform)
  platform: SocialMediaPlatform;

  @Field(() => String)
  username: string;

  @Field(() => User)
  createdBy: Partial<User>;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;
}
