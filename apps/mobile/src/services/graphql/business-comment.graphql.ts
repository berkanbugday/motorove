import {gql} from '@apollo/client';

export const BUSINESS_COMMENT_FRAGMENT = gql`
  fragment BusinessCommentFragment on BusinessCommentDto {
    id
    content
    rating
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

export const GET_BUSINESS_COMMENTS = gql`
  query GetBusinessComments($businessId: ID!, $limit: Int, $skip: Int) {
    businessComments(businessId: $businessId, limit: $limit, skip: $skip) {
      ...BusinessCommentFragment
    }
  }
  ${BUSINESS_COMMENT_FRAGMENT}
`;

export const GET_BUSINESS_COMMENT = gql`
  query GetBusinessComment($id: ID!) {
    businessComment(id: $id) {
      ...BusinessCommentFragment
    }
  }
  ${BUSINESS_COMMENT_FRAGMENT}
`;

export const GET_BUSINESS_AVERAGE_RATING = gql`
  query GetBusinessAverageRating($businessId: ID!) {
    businessAverageRating(businessId: $businessId)
  }
`;

export const GET_BUSINESS_COMMENT_COUNT = gql`
  query GetBusinessCommentCount($businessId: ID!) {
    businessCommentCount(businessId: $businessId)
  }
`;

export const CREATE_BUSINESS_COMMENT = gql`
  mutation CreateBusinessComment($input: CreateBusinessCommentInput!) {
    createBusinessComment(input: $input) {
      ...BusinessCommentFragment
    }
  }
  ${BUSINESS_COMMENT_FRAGMENT}
`;

export const UPDATE_BUSINESS_COMMENT = gql`
  mutation UpdateBusinessComment($input: UpdateBusinessCommentInput!) {
    updateBusinessComment(input: $input) {
      ...BusinessCommentFragment
    }
  }
  ${BUSINESS_COMMENT_FRAGMENT}
`;

export const REMOVE_BUSINESS_COMMENT = gql`
  mutation RemoveBusinessComment($id: ID!) {
    removeBusinessComment(id: $id)
  }
`;
