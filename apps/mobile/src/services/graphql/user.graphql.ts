import {gql} from '@apollo/client';

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFragment on UserDto {
    id
    firstName
    lastName
    email
    avatar
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

export const ACCOUNT_SETUP = gql`
  mutation AccountSetup($input: AccountSetupInput!) {
    accountSetup(input: $input)
  }
`;
