import {gql} from '@apollo/client';

export const COMMENT_FRAGMENT = gql`
  fragment CommentFragment on CommentDto {
    id
    content
    postId
    parentId
    createdAt
    updatedAt
    createdBy {
      id
      firstName
      lastName
      avatar
    }
    replies {
      id
      content
      createdAt
      updatedAt
      createdBy {
        id
        firstName
        lastName
        avatar
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($postId: ID!) {
    comments(postId: $postId) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const GET_COMMENT = gql`
  query GetComment($id: ID!) {
    comment(id: $id) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const CREATE_COMMENT = gql`
  mutation CreateComment($input: CreateCommentInput!) {
    createComment(input: $input) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const UPDATE_COMMENT = gql`
  mutation UpdateComment($input: UpdateCommentInput!) {
    updateComment(input: $input) {
      ...CommentFragment
    }
  }
  ${COMMENT_FRAGMENT}
`;

export const REMOVE_COMMENT = gql`
  mutation RemoveComment($id: ID!) {
    removeComment(id: $id) {
      id
    }
  }
`;
