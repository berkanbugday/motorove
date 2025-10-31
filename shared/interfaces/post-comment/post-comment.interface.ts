import { IBase } from "../common";
import { IPost } from "../post";

/**
 * PostComment Interface
 * Interface for post comments
 */
export interface IPostComment extends IBase {
  content: string;
  postId: string;
  post?: Partial<IPost>;
}
