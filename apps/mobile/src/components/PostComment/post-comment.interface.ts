import {ImageSourcePropType} from 'react-native';
import {IconName} from '../Icon';

export interface PostComment {
  id: string;
  userId: string;
  userName: string;
  avatarSource: ImageSourcePropType;
  content: string;
  timeAgo: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
  parentId?: string; // If this is a reply, this will be the parent comment id
}

export interface PostWithComments {
  id: string;
  userName: string;
  avatarSource: ImageSourcePropType;
  timeAgo: string;
  content: string;
  images?: ImageSourcePropType[];
  routeTitle?: string;
  likeCount: number;
  commentCount: number;
  isSaved: boolean;
  isLiked: boolean;
  isCommented: boolean;
  labels: Array<{
    icon?: IconName;
    text: string;
  }>;
  comments: PostComment[];
}
