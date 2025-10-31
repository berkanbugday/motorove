import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';
import {POST_ADDRESS_FRAGMENT} from './post-address.graphql';
import {POST_COMMENT_FRAGMENT} from './post-comment.graphql';

export const POST_FRAGMENT = gql`
  fragment PostFragment on PostDto {
    id
    content
    images {
      url
      isCensored
    }
    likesCount
    commentsCount
    isLiked
    isSaved
    createdBy {
      ...UserFragment
    }
    createdAt
    groupId
    groupName
    addresses {
      ...PostAddressFragment
    }
    likedUsers {
      ...UserFragment
    }
    comments {
      ...PostCommentFragment
    }
  }
  ${USER_FRAGMENT}
  ${POST_ADDRESS_FRAGMENT}
  ${POST_COMMENT_FRAGMENT}
`;

export const GET_POSTS = gql`
  query GetPosts(
    $groupId: ID
    $createdById: ID
    $savedById: ID
    $limit: Int
    $skip: Int
  ) {
    posts(
      groupId: $groupId
      createdById: $createdById
      savedById: $savedById
      limit: $limit
      skip: $skip
    ) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

// Create post mutation
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    createPost(input: $input) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      ...PostFragment
    }
  }
  ${POST_FRAGMENT}
`;

export const REMOVE_POST = gql`
  mutation RemovePost($id: ID!) {
    removePost(id: $id) {
      id
    }
  }
`;

export const LIKE_POST = gql`
  mutation LikePost($postId: ID!) {
    likePost(postId: $postId) {
      postId
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId) {
      postId
    }
  }
`;

export const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId) {
      postId
    }
  }
`;

export const UNSAVE_POST = gql`
  mutation UnsavePost($postId: ID!) {
    unsavePost(postId: $postId) {
      postId
    }
  }
`;
