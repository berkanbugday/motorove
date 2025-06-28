import { IBase, IBaseWithRelations } from "./base.interface";

/**
 * Post Interface
 * Interface for social posts
 */
export interface IPost extends IBase {
  content: string;
  images?: string[];
  groupId?: string | null;
}

/**
 * Post with relations
 */
export interface IPostWithRelations extends IBaseWithRelations, IPost {
  group?: {
    id: string;
    name: string;
    logo?: string | null;
  } | null;

  comments?: Array<{
    id: string;
    content: string;
    createdById: string;
    createdAt: Date | string;
  }>;

  likes?: Array<{
    id: string;
    userId: string;
  }>;

  saves?: Array<{
    id: string;
    userId: string;
  }>;

  addresses?: Array<{
    id: string;
    address: string;
    type: string;
    latitude: number;
    longitude: number;
  }>;

  likesCount?: number;
  commentsCount?: number;
  savesCount?: number;
  isLiked?: boolean;
  isSaved?: boolean;
}
