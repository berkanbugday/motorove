import { IUser } from "../user";
import { InvitationStatus } from "../../enums/invitation-status.enum";

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
  follower?: Partial<IUser>;

  /**
   * User who is being followed
   */
  following?: Partial<IUser>;

  /**
   * Date and time the follow relationship was created
   */
  createdAt: Date;

  /**
   * Date and time the follow relationship was updated
   */
  updatedAt: Date;

  /**
   * Status of the follow relationship
   */
  status: InvitationStatus;
}
