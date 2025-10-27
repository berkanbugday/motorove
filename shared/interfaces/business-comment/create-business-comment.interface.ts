/**
 * Create BusinessComment Interface
 * Used for creating new business comments/reviews
 */
export interface ICreateBusinessComment {
  /**
   * Comment text content
   */
  content: string;

  /**
   * Rating from 1 to 5 stars
   */
  rating: number;

  /**
   * ID of the business this comment belongs to
   */
  businessId: string;
}
