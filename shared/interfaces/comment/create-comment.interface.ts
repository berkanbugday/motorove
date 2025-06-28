/**
 * Create Comment Interface
 * Used for creating new comments
 */
export interface ICreateComment {
  /**
   * Comment text content
   */
  content: string;

  /**
   * ID of the post this comment belongs to
   */
  postId: string;

  /**
   * Optional parent comment ID (for replies)
   */
  parentId?: string | null;
}
