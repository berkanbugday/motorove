import gql from 'graphql-tag';

export const POSTS_FRAGMENT = gql`
  fragment PostFields on Post {
    id
    content
    images
    latitude
    longitude
    groupId
    group {
      id
      name
      image
    }
    likesCount
    savesCount
    commentsCount
    isLiked
    isSaved
    createdAt
    updatedAt
    createdById
  }
`;

export const GET_POSTS = gql`
  query GetPosts($groupId: ID!, $createdById: ID) {
    posts(groupId: $groupId, createdById: $createdById) {
      ...PostFields
    }
  }
  ${POSTS_FRAGMENT}
`;

export const GET_POST = gql`
  query GetPost($id: ID!) {
    post(id: $id) {
      ...PostFields
      comments {
        id
        content
        createdAt
        updatedAt
        createdById
      }
    }
  }
  ${POSTS_FRAGMENT}
`;

export const CREATE_POST = gql`
  mutation CreatePost($createPostInput: CreatePostInput!) {
    createPost(createPostInput: $createPostInput) {
      ...PostFields
    }
  }
  ${POSTS_FRAGMENT}
`;

export const UPDATE_POST = gql`
  mutation UpdatePost($updatePostInput: UpdatePostInput!) {
    updatePost(updatePostInput: $updatePostInput) {
      ...PostFields
    }
  }
  ${POSTS_FRAGMENT}
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
