import { IUser } from "../user";

/**
 * User Following Interface
 * Represents a follow relationship between users
 */
export interface IUserFollowing {
  /**
   * ID of the follow relationship
   */
  id: string;

  /**
   * User who is following
   */
  follower: Partial<IUser>;

  /**
   * User who is being followed
   */
  following: Partial<IUser>;

  /**
   * Date and time the follow relationship was created
   */
  createdAt: Date;
}
