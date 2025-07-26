import {gql} from '@apollo/client';
import {USER_FRAGMENT} from './user.graphql';

// Fragment
export const FOLLOW_REQUEST_FRAGMENT = gql`
  fragment FollowRequestFragment on FollowRequestDto {
    id
    user {
      ...UserFragment
    }
    createdAt
    status
  }
  ${USER_FRAGMENT}
`;

// Queries
export const GET_MY_FOLLOW_REQUESTS = gql`
  query GetMyFollowRequests($limit: Int, $skip: Int) {
    myFollowRequests(limit: $limit, skip: $skip) {
      ...FollowRequestFragment
    }
  }
  ${FOLLOW_REQUEST_FRAGMENT}
`;

// Mutations
export const ACCEPT_FOLLOW_REQUEST = gql`
  mutation AcceptFollowRequest($id: ID!) {
    acceptFollowRequest(id: $id) {
      ...FollowRequestFragment
    }
  }
  ${FOLLOW_REQUEST_FRAGMENT}
`;

export const REJECT_FOLLOW_REQUEST = gql`
  mutation RejectFollowRequest($id: ID!) {
    rejectFollowRequest(id: $id) {
      ...FollowRequestFragment
    }
  }
  ${FOLLOW_REQUEST_FRAGMENT}
`;
