/**
 * Update User Interface
 * Used for updating existing users
 */
export interface IUpdateUser {
  /**
   * First name
   */
  firstName?: string | null;

  /**
   * Last name
   */
  lastName?: string | null;

  /**
   * Email
   */
  email?: string;

  /**
   * User avatar URL
   */
  avatar?: string | null;

  /**
   * Whether the user is active
   */
  isActive?: boolean;
}
