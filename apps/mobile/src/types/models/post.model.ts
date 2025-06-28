/**
 * Post domain model
 * Based on the backend Post model
 */

import {AddressType, Language} from '../enums';
import {Address} from './address.model';
import {Comment} from './comment.model';
import {Group} from './group.model';
import {UserProfile} from './user.model';

/**
 * Post content types
 */
export type PostContentType = 'text' | 'image' | 'video' | 'poll' | 'link';

/**
 * Post Address model for multi-language support
 */
export interface PostAddress {
  id: string;
  postId: string;
  address: string;
  language: Language;
  type: AddressType;
  latitude: number;
  longitude: number;
}

/**
 * Post Address Input
 */
export interface PostAddressInput {
  address: string;
  language: Language;
  type: AddressType;
  latitude: number;
  longitude: number;
}

/**
 * Basic post information
 */
export interface Post {
  id: string;
  content: string;
  images?: string[];
  groupId?: string;
  createdById: string;
  updatedById: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;

  // Additional fields for frontend
  likesCount?: number;
  commentsCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}

/**
 * Post with relations
 */
export interface PostWithRelations extends Post {
  group?: Group;
  createdBy?: UserProfile;
  updatedBy?: UserProfile;
  addresses?: Address[];
  comments?: Comment[];
  likes?: any[]; // Will be properly typed as PostLike[]
  saves?: any[]; // Will be properly typed as PostSave[]
}

/**
 * Comment model (simplified to avoid circular dependency)
 */
export interface Comment {
  id: string;
  content: string;
  postId: string;
  parentId?: string;
  replies?: Comment[];
  createdBy: UserProfile;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

/**
 * Create comment input
 */
export interface CreateCommentInput {
  content: string;
  postId: string;
  parentId?: string;
}

/**
 * Update comment input
 */
export interface UpdateCommentInput {
  id: string;
  content?: string;
}

/**
 * Post like interface
 */
export interface PostLike {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

/**
 * Post save interface
 */
export interface PostSave {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

/**
 * Create post input
 */
export interface CreatePostInput {
  content: string;
  images?: string[];
  groupId?: string | null;
  addresses?: PostAddressInput[];
}

/**
 * Update post input
 */
export interface UpdatePostInput {
  id: string;
  content?: string;
  images?: string[];
  groupId?: string | null;
  addresses?: PostAddressInput[];
}

/**
 * Post with media content
 */
export interface MediaPost extends Post {
  contentType: 'image' | 'video';
  mediaUrl: string;
  thumbnailUrl?: string;
  mediaDuration?: number; // for videos
}

/**
 * Post with poll
 */
export interface PollPost extends Post {
  contentType: 'poll';
  pollOptions: Array<{
    id: string;
    text: string;
    votes: number;
  }>;
  pollEndsAt?: string;
}

/**
 * Post with user information
 */
export interface PostWithUser extends Post {
  user: {
    id: string;
    name: string;
    avatar?: string;
  };
}
