import { ICreateAddress } from "../address";

/**
 * Create Post Interface
 */
export interface ICreatePost {
  /**
   * Content of the post
   */
  content: string;

  /**
   * Optional array of image URLs
   */
  images?: string[] | null;

  /**
   * Optional group ID
   */
  groupId?: string | null;

  /**
   * Optional addresses related to the post
   */
  addresses?: ICreateAddress[] | null;
}
