/**
 * Filter Post Interface
 * Used for filtering posts in queries
 */
export interface IFilterPost {
  /**
   * Optional author ID to filter posts by
   */
  authorId?: string;

  /**
   * Optional group ID to filter posts by
   */
  groupId?: string | null;

  /**
   * Optional content text for partial matching
   */
  content?: string;

  /**
   * Optional location radius search in kilometers
   */
  radiusKm?: number;

  /**
   * Optional latitude coordinate for radius search
   */
  latitude?: number;

  /**
   * Optional longitude coordinate for radius search
   */
  longitude?: number;

  /**
   * Filter by posts with images only
   */
  hasImages?: boolean;

  /**
   * Include posts from following users only
   */
  fromFollowingOnly?: boolean;
}
