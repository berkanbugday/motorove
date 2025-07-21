import { IUser } from "../user";
import { IAddress } from "../address";
import { IComment } from "../comment";
import { IGroup } from "../group";

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
  addresses?: IAddress[];
  comments?: IComment[];
  group?: IGroup;
}
