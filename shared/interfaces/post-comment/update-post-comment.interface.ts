/**
 * Update PostComment Interface
 * Used for updating existing post comments
 */
export interface IUpdatePostComment {
  id: string;
  /**
   * Updated comment text content
   */
  content?: string;
}
