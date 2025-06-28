/**
 * Create User Interface
 * Used for creating new users
 */
export interface ICreateUser {
  /**
   * User email
   */
  email: string;

  /**
   * First name
   */
  firstName?: string;

  /**
   * Last name
   */
  lastName?: string;

  /**
   * Supabase ID
   */
  supabaseId: string;

  /**
   * User avatar URL
   */
  avatar?: string;
}
