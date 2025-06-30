/**
 * User Interface
 * Base user information
 */
export interface IUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  avatar?: string;
  supabaseId: string;
  createdAt: Date;
  updatedAt: Date;
  isFollowing?: boolean;
  isActive: boolean;
}
