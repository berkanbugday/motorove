import { ICreatePost } from "./create-post.interface";

/**
 * Update Post Interface
 */
export interface IUpdatePost extends Partial<ICreatePost> {
  id: string;
}
