import {gql} from '@apollo/client';

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    firstName
    lastName
    avatar
    isFollowing
  }
`;

// Queries
export const SEARCH_USERS = gql`
  query SearchUsers($input: SearchUsersInput!) {
    searchUsers(searchUsersInput: $input) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
