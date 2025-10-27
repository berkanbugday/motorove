import { IBase } from "../common";
import { IPost } from "../post";

/**
 * PostComment Interface
 * Interface for post comments
 */
export interface IPostComment extends IBase {
  content: string;
  postId: string;
  parentId?: string | null;
  post?: Partial<IPost>;
  parent?: Partial<IPostComment> | null;
  replies?: Partial<IPostComment>[];
}
