/**
 * Update BusinessComment Interface
 * Used for updating existing business comments/reviews
 */
export interface IUpdateBusinessComment {
  id: string;
  /**
   * Updated comment text content
   */
  content?: string;
  /**
   * Updated rating from 1 to 5 stars
   */
  rating?: number;
}
