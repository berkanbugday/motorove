import {gql} from '@apollo/client';
import {COMMENT_FRAGMENT} from './comment.graphql';
import {GROUP_FRAGMENT} from './group.graphql';
import {USER_FRAGMENT} from './user.graphql';
import {ADDRESS_FRAGMENT, CREATE_ADDRESS_FRAGMENT} from './address.graphql';

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
    addresses {
      ...AddressFragment
    }
    comments {
      ...CommentFragment
    }
    group {
      ...GroupFragment
    }
  }
  ${COMMENT_FRAGMENT}
  ${GROUP_FRAGMENT}
  ${USER_FRAGMENT}
  ${ADDRESS_FRAGMENT}
`;

export const CREATE_POST_FRAGMENT = gql`
  fragment CreatePostFragment on PostDto {
    content
    images
    groupId
    addresses {
      ...CreateAddressFragment
    }
  }
  ${CREATE_ADDRESS_FRAGMENT}
`;

export const UPDATE_POST_FRAGMENT = gql`
  fragment UpdatePostFragment on PostDto {
    id
    ...CreatePostFragment
  }
  ${CREATE_POST_FRAGMENT}
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
      comments {
        id
        content
        createdAt
        updatedAt
        createdById
      }
    }
  }
  ${POST_FRAGMENT}
`;

// Create post mutation
export const CREATE_POST = gql`
  mutation CreatePost($input: CreatePostInput!) {
    create(input: $input) {
      ...CreatePostFragment
    }
  }
  ${CREATE_POST_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($input: UpdatePostInput!) {
    updatePost(input: $input) {
      ...UpdatePostFragment
    }
  }
  ${UPDATE_POST_FRAGMENT}
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
      id
      postId
    }
  }
`;

export const UNLIKE_POST = gql`
  mutation UnlikePost($postId: ID!) {
    unlikePost(postId: $postId)
  }
`;

export const SAVE_POST = gql`
  mutation SavePost($postId: ID!) {
    savePost(postId: $postId) {
      id
      postId
    }
  }
`;

export const UNSAVE_POST = gql`
  mutation UnsavePost($postId: ID!) {
    unsavePost(postId: $postId)
  }
`;
