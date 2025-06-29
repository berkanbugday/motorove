/**
 * User Interface
 * Base user information
 */
export interface IUser {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  avatar?: string;
  supabaseId: string;
  createdAt: Date;
  updatedAt: Date;
  isFollowing?: boolean;
  isActive: boolean;
}
