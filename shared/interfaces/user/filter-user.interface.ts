/**
 * Filter User Interface
 * Used for filtering users in queries
 */
export interface IFilterUser {
  /**
   * Optional email for exact match
   */
  email?: string;

  /**
   * Optional search term for matching name or email
   */
  searchTerm?: string;

  /**
   * Filter by active status
   */
  isActive?: boolean;

  /**
   * Optional Supabase ID for exact match
   */
  supabaseId?: string;

  /**
   * Optional list of user IDs to include
   */
  ids?: string[];
}
