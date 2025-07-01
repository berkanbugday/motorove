import { registerEnumType } from '@nestjs/graphql';
import { SocialMediaPlatform } from '@motorove/shared';

registerEnumType(SocialMediaPlatform, {
  name: 'SocialMediaPlatform',
  description: 'Social media platform types',
});

export { SocialMediaPlatform };
