import { IBase, IBaseWithRelations } from "./base.interface";

/**
 * Post Like Interface
 * Interface for post likes
 */
export interface IPostLike extends IBase {
  postId: string;
  userId: string;
}

/**
 * Post Like with relations
 */
export interface IPostLikeWithRelations extends IBaseWithRelations, IPostLike {
  post?: {
    id: string;
    content: string;
  };

  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}

/**
 * Post Save Interface
 * Interface for post saves (bookmarks)
 */
export interface IPostSave extends IBase {
  postId: string;
  userId: string;
}

/**
 * Post Save with relations
 */
export interface IPostSaveWithRelations extends IBaseWithRelations, IPostSave {
  post?: {
    id: string;
    content: string;
  };

  user?: {
    id: string;
    email: string;
    firstName?: string | null;
    lastName?: string | null;
    avatar?: string | null;
  };
}
