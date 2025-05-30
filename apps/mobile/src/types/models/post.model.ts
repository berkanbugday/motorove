/**
 * Post domain model
 */

/**
 * Post content types
 */
export type PostContentType = 'text' | 'image' | 'video' | 'poll' | 'link';

/**
 * Base post interface
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
  likesCount: number;
  savesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdAt: string;
  updatedAt: string;
  createdById: string;
}

/**
 * Comment interface
 */
export interface Comment {
  id: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  createdById: string;
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
  groupId?: string;
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
  groupId?: string;
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
