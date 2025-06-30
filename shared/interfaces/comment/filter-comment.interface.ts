/**
 * Filter Comment Interface
 * Used for filtering comments in queries
 */
export interface IFilterComment {
  /**
   * Optional post ID to filter comments by
   */
  postId?: string;

  /**
   * Optional parent comment ID to filter replies
   */
  parentId?: string;

  /**
   * Optional isActive flag to filter comments by
   */
  isActive?: boolean;

  /**
   * Optional author ID to filter comments by
   */
  createdById?: string;
}
