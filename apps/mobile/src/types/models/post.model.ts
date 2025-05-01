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
  userId: string;
  title?: string;
  content: string;
  contentType: PostContentType;
  likes: number;
  comments: number;
  createdAt: string;
  updatedAt: string;
  isPublished: boolean;
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
