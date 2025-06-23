import {gql} from '@apollo/client';

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    firstName
    lastName
    avatar
  }
`;

// Queries
export const SEARCH_USERS = gql`
  query SearchUsers($query: String!, $limit: Int, $skip: Int) {
    searchUsers(query: $query, limit: $limit, skip: $skip) {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
