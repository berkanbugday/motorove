/**
 * Create PostComment Interface
 * Used for creating new post comments
 */
export interface ICreatePostComment {
  /**
   * Comment text content
   */
  content: string;

  /**
   * ID of the post this comment belongs to
   */
  postId: string;
}
