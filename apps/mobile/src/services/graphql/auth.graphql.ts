import {gql} from '@apollo/client';

// User fragment to reuse in queries
export const USER_FRAGMENT = gql`
  fragment UserFragment on User {
    id
    email
    firstName
    lastName
    avatar
    supabaseId
  }
`;

// Session fragment
export const SESSION_FRAGMENT = gql`
  fragment SessionFragment on Session {
    access_token
    refresh_token
    expires_in
  }
`;

// Auth response fragment
export const AUTH_RESPONSE_FRAGMENT = gql`
  fragment AuthResponseFragment on AuthResponse {
    user {
      ...UserFragment
    }
    session {
      ...SessionFragment
    }
  }
  ${USER_FRAGMENT}
  ${SESSION_FRAGMENT}
`;

// Sign up mutation
export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(signUpInput: $input) {
      ...AuthResponseFragment
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

// Sign in mutation
export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(signInInput: $input) {
      ...AuthResponseFragment
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

// Refresh token mutation (if your backend supports it)
export const REFRESH_TOKEN = gql`
  mutation RefreshToken($token: String!) {
    refreshToken(token: $token) {
      ...AuthResponseFragment
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

// Get current user query (if needed)
export const GET_CURRENT_USER = gql`
  query GetCurrentUser {
    me {
      ...UserFragment
    }
  }
  ${USER_FRAGMENT}
`;
