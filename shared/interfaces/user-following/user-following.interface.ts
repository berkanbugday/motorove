import { IBase } from "../common";
import { IUser } from "../user";

/**
 * User Following Interface
 * Represents a follow relationship between users
 */
export interface IUserFollowing extends IBase {
  /**
   * User who is following
   */
  follower: IUser;

  /**
   * User who is being followed
   */
  following: IUser;

  /**
   * ID of the follower user
   */
  followerId: string;

  /**
   * ID of the following user
   */
  followingId: string;
}
