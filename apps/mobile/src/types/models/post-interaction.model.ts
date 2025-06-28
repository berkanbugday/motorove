/**
 * Post Interaction domain models
 * Based on the backend PostLike and PostSave models
 */

/**
 * Base interface for post interactions
 */
interface PostInteractionBase {
  id: string;
  postId: string;
  userId: string;
  createdAt: string;
}

/**
 * Post like information
 */
export interface PostLike extends PostInteractionBase {}

/**
 * Post save information
 */
export interface PostSave extends PostInteractionBase {}

/**
 * Post interaction with relations
 */
export interface PostInteractionWithRelations extends PostInteractionBase {
  post?: any; // Will define proper Post type
  user?: any; // Will define proper User type
}
