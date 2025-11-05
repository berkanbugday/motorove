import { SocialMediaPlatform } from "../../enums/social-media-platform.enum";

/**
 * User Social Media Interface
 * Represents a user's social media account link
 */
export interface IUserSocialMediaProfile {
  id: string;
  platform: SocialMediaPlatform;
  username: string;
}
