/**
 * User Interface
 * Base user information
 */
export interface IUser {
  id: string;
  email: string;
  firstName?: string | null;
  lastName?: string | null;
  avatar?: string | null;
  supabaseId: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  isFollowing?: boolean;
  isActive: boolean;
}
