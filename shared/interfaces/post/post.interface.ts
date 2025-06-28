import { IUser } from "../user";
import { IAddress } from "../address";
import { IComment } from "../comment";

export interface IPost {
  id: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdBy: Partial<IUser>;
  createdAt: Date;
  addresses: Partial<IAddress>[];
  comments: Partial<IComment>[];
}
