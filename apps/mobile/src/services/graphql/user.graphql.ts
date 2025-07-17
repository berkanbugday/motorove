import {gql} from '@apollo/client';

// User fragment
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    firstName
    lastName
    email
    avatar
  }
`;

export const ACCOUNT_SETUP_FRAGMENT = gql`
  fragment AccountSetupFragment on User {
    cityId
    dateOfBirth
    gender
    ridingStyles
    interests
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
    accountSetup(input: $input) {
      ...AccountSetupFragment
    }
  }
  ${ACCOUNT_SETUP_FRAGMENT}
`;
