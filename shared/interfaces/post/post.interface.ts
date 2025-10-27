import { IUser } from "../user";
import { IAddress } from "../address";
import { IPostComment } from "../post-comment";
import { IImage } from "./image.interface";

export interface IPost {
  id: string;
  content: string;
  images?: IImage[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdBy: IUser;
  createdAt: Date;
  groupId?: string;
  groupName?: string;
  addresses?: IAddress[];
  likedUsers?: IUser[];
  comments?: IPostComment[];
}
