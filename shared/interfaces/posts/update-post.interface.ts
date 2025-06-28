import { ICreatePost } from "./create-post.interface";

/**
 * Update Post Interface
 * Extends the create post interface with an ID field
 */
export interface IUpdatePost extends Partial<ICreatePost> {
  /**
   * ID of the post to update
   */
  id: string;
}
