import { IBase, IBaseWithRelations } from "./base.interface";

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
  post?: {
    id: string;
    content: string;
  };

  parent?: {
    id: string;
    content: string;
    createdById: string;
  } | null;

  replies?: Array<{
    id: string;
    content: string;
    createdById: string;
    createdAt: Date | string;
  }>;

  repliesCount?: number;
}
