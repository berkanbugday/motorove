import { IBase, IBaseWithRelations } from "../common";
import { IPost } from "../post";

/**
 * Comment Interface
 * Interface for post comments
 */
export interface IComment extends IBase {
  content: string;
  postId: string;
  parentId?: string | null;
}

/**
 * Comment with relations
 */
export interface ICommentWithRelations extends IBaseWithRelations, IComment {
  post?: Partial<IPost>;
  parent?: Partial<IComment> | null;
  replies?: Partial<IComment>[];
}
