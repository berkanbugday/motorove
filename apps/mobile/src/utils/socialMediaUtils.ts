import {Linking} from 'react-native';
import {SocialMediaPlatform} from '@motorove/shared';
import {IconName} from '@components';

/**
 * Social Media Utility Functions
 * Shared utilities for handling social media platforms across the app
 */

/**
 * Maps social media platform enum to icon names
 */
export const getSocialMediaIcon = (platform: SocialMediaPlatform): IconName => {
  const iconMap: Record<SocialMediaPlatform, IconName> = {
    [SocialMediaPlatform.INSTAGRAM]: 'instagram',
    [SocialMediaPlatform.FACEBOOK]: 'facebook',
    [SocialMediaPlatform.TIKTOK]: 'tiktok',
    [SocialMediaPlatform.YOUTUBE]: 'youtube',
    [SocialMediaPlatform.LINKEDIN]: 'linkedin',
    [SocialMediaPlatform.X]: 'x',
  };
  return iconMap[platform] || 'link';
};

/**
 * Gets the URL prefix for a social media platform
 */
export const getSocialMediaPrefix = (platform: SocialMediaPlatform): string => {
  const prefixes: Record<SocialMediaPlatform, string> = {
    [SocialMediaPlatform.INSTAGRAM]: 'instagram.com/',
    [SocialMediaPlatform.FACEBOOK]: 'facebook.com/',
    [SocialMediaPlatform.YOUTUBE]: 'youtube.com/',
    [SocialMediaPlatform.TIKTOK]: 'tiktok.com/@',
    [SocialMediaPlatform.LINKEDIN]: 'linkedin.com/in/',
    [SocialMediaPlatform.X]: 'x.com/',
  };
  return prefixes[platform] || '';
};

/**
 * Builds full URL from username or partial URL based on platform
 */
export const buildFullUrl = (
  username: string,
  platform: SocialMediaPlatform,
): string => {
  // If it's already a full URL, return it
  if (username.startsWith('http://') || username.startsWith('https://')) {
    return username;
  }

  // Remove @ symbol if present
  const cleanUsername = username.replace(/^@/, '');

  // Build platform-specific URLs
  const platformUrls: Record<SocialMediaPlatform, string> = {
    [SocialMediaPlatform.INSTAGRAM]: `https://instagram.com/${cleanUsername}`,
    [SocialMediaPlatform.FACEBOOK]: `https://facebook.com/${cleanUsername}`,
    [SocialMediaPlatform.TIKTOK]: `https://tiktok.com/@${cleanUsername}`,
    [SocialMediaPlatform.YOUTUBE]: `https://youtube.com/@${cleanUsername}`,
    [SocialMediaPlatform.LINKEDIN]: `https://linkedin.com/in/${cleanUsername}`,
    [SocialMediaPlatform.X]: `https://x.com/${cleanUsername}`,
  };

  return platformUrls[platform];
};

/**
 * Gets app deep link for a social media platform
 */
export const getSocialMediaAppLink = (
  platform: SocialMediaPlatform,
  username: string,
): string => {
  const appLinks: Record<SocialMediaPlatform, string> = {
    [SocialMediaPlatform.INSTAGRAM]: `instagram://user?username=${username}`,
    [SocialMediaPlatform.FACEBOOK]: `fb://profile/${username}`,
    [SocialMediaPlatform.TIKTOK]: `tiktok://user?username=${username}`,
    [SocialMediaPlatform.YOUTUBE]: `youtube://user/${username}`,
    [SocialMediaPlatform.LINKEDIN]: `linkedin://profile/${username}`,
    [SocialMediaPlatform.X]: `twitter://user?screen_name=${username}`,
  };

  return appLinks[platform];
};

/**
 * Opens social media URL with app deep link fallback
 * Tries to open in native app first, falls back to web browser
 */
export const openSocialMediaUrl = async (
  platform: SocialMediaPlatform,
  username: string,
): Promise<void> => {
  // Validate URL format
  if (!username || typeof username !== 'string' || username.trim() === '') {
    console.error('Invalid username provided:', username);
    return;
  }

  const cleanUsername = username.replace(/^@/, '');
  const fullUrl = buildFullUrl(username, platform);
  const appLink = getSocialMediaAppLink(platform, cleanUsername);

  try {
    // First, try to check if the app is installed and open in app
    const canOpen = await Linking.canOpenURL(appLink);
    if (canOpen) {
      await Linking.openURL(appLink);
      return;
    }
  } catch (appErr) {
    console.error('Failed to open app link:', appErr);
  }

  // Fallback to web URL
  try {
    await Linking.openURL(fullUrl);
  } catch (webErr) {
    console.error('Failed to open URL:', webErr);
    throw webErr;
  }
};
