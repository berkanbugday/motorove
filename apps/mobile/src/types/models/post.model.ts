/**
 * Post domain model
 */

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
  language: string;
}

/**
 * Post Address Input
 */
export interface PostAddressInput {
  address: string;
  language: string;
}

/**
 * Post model
 */
export interface Post {
  id: string;
  content: string;
  images?: string[];
  latitude?: number | null;
  longitude?: number | null;
  groupId?: string;
  group?: {
    id: string;
    name: string;
    image?: string;
  };
  comments?: Comment[];
  addresses?: PostAddress[];
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdBy: UserProfile;
  updatedBy?: UserProfile;
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
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
}

/**
 * Post save interface
 */
export interface PostSave {
  id: string;
  postId: string;
}

/**
 * Create post input
 */
export interface CreatePostInput {
  content: string;
  images?: string[];
  latitude?: number;
  longitude?: number;
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
  latitude?: number;
  longitude?: number;
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
