import { IUser } from "../user";
import { IAddress } from "../address";

export interface IPost {
  id: string;
  content: string;
  images?: string[];
  likesCount: number;
  commentsCount: number;
  isLiked: boolean;
  isSaved: boolean;
  createdBy: IUser;
  createdAt: Date;
  groupId?: string;
  groupName?: string;
  addresses?: IAddress[];
}
