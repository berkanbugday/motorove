import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';
import {ADDRESS_FRAGMENT} from './address.graphql';

export const POST_FRAGMENT = gql`
  fragment PostFragment on PostDto {
    id
    content
    images
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
      ...AddressFragment
    }
  }
  ${USER_FRAGMENT}
  ${ADDRESS_FRAGMENT}
`;

export const GET_POSTS = gql`
  query GetPosts($groupId: ID, $createdById: ID, $limit: Int, $skip: Int) {
    posts(
      groupId: $groupId
      createdById: $createdById
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

export const GET_POST_LIKED_USERS = gql`
  query GetPostLikedUsers($postId: ID!) {
    postLikedUsers(postId: $postId) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
