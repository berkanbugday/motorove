import {gql} from '@apollo/client';
import {COMMENT_FRAGMENT} from './comment.graphql';
import {GROUP_FRAGMENT} from './group.graphql';
import {USER_FRAGMENT} from './user.graphql';

export const POST_ADDRESS_FRAGMENT = gql`
  fragment PostAddressFragment on AddressDto {
    id
    address
    language
    type
    latitude
    longitude
  }
`;

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
      ...PostAddressFragment
    }
    comments {
      ...CommentFragment
    }
    group {
      ...GroupFragment
    }
  }
  ${POST_ADDRESS_FRAGMENT}
  ${COMMENT_FRAGMENT}
  ${GROUP_FRAGMENT}
  ${USER_FRAGMENT}
`;

export const CREATE_POST_FRAGMENT = gql`
  fragment CreatePostFragment on PostDto {
    content
    images
    latitude
    longitude
    groupId
    addresses {
      ...PostAddressFragment
    }
  }
  ${POST_ADDRESS_FRAGMENT}
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
    createPost(input: $input) {
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
