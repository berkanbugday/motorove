import { ICreateAddress } from "./create-address.interface";

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
  images?: string[];

  /**
   * Optional group ID
   */
  groupId?: string;

  /**
   * Optional addresses related to the post
   */
  addresses?: ICreateAddress[];
}
