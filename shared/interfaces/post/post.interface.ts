import { IUser } from "../user";
import { IPostAddress } from "./post-address.interface";
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
  addresses?: IPostAddress[];
  likedUsers?: IUser[];
  comments?: IPostComment[];
}
