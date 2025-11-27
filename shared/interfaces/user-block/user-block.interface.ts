import { IUser } from "../user";

/**
 * User Following Interface
 * Represents a block relationship between users
 */
export interface IUserBlock {
  /**
   * ID of the block relationship
   */
  id: string;

  /**
   * User who is being blocked
   */
  blocked?: Partial<IUser>;

  /**
   * Date and time the block relationship was created
   */
  createdAt: Date;
}
