import {ImageSourcePropType} from 'react-native';
import {IconName} from '../Icon';

export interface PostComment {
  id: string;
  userId: string;
  fullName: string;
  avatarSource: ImageSourcePropType;
  content: string;
  timeAgo: string;
  likeCount: number;
  replyCount: number;
  isLiked: boolean;
}

export interface PostWithComments {
  id: string;
  fullName: string;
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
