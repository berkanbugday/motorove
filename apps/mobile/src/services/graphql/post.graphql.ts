import {gql} from '@apollo/client';

export const POST_FRAGMENT = gql`
  fragment PostFragment on Post {
    id
    content
    images
    latitude
    longitude
    group {
      id
      name
    }
    likesCount
    commentsCount
    isLiked
    isSaved
    createdAt
    updatedAt
    createdBy {
      id
      firstName
      lastName
      avatar
    }
  }
`;

export const CREATE_POST_FRAGMENT = gql`
  fragment CreatePostFragment on Post {
    content
    images
    latitude
    longitude
    groupId
  }
`;

export const GET_POSTS = gql`
  query GetPosts($groupId: ID, $createdById: ID) {
    posts(groupId: $groupId, createdById: $createdById) {
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
    createPost(createPostInput: $input) {
      ...CreatePostFragment
    }
  }
  ${CREATE_POST_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
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
