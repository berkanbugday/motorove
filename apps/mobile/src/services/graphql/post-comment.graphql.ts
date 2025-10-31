import {gql} from '@apollo/client';

export const POST_COMMENT_FRAGMENT = gql`
  fragment PostCommentFragment on PostCommentDto {
    id
    content
    postId
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

export const GET_POST_COMMENTS = gql`
  query GetPostComments($postId: ID!) {
    postComments(postId: $postId) {
      ...PostCommentFragment
    }
  }
  ${POST_COMMENT_FRAGMENT}
`;

export const GET_POST_COMMENT = gql`
  query GetPostComment($id: ID!) {
    postComment(id: $id) {
      ...PostCommentFragment
    }
  }
  ${POST_COMMENT_FRAGMENT}
`;

export const CREATE_POST_COMMENT = gql`
  mutation CreatePostComment($input: CreatePostCommentInput!) {
    createPostComment(input: $input) {
      ...PostCommentFragment
    }
  }
  ${POST_COMMENT_FRAGMENT}
`;

export const UPDATE_POST_COMMENT = gql`
  mutation UpdatePostComment($input: UpdatePostCommentInput!) {
    updatePostComment(input: $input) {
      ...PostCommentFragment
    }
  }
  ${POST_COMMENT_FRAGMENT}
`;

export const REMOVE_POST_COMMENT = gql`
  mutation RemovePostComment($id: ID!) {
    removePostComment(id: $id) {
      id
    }
  }
`;
