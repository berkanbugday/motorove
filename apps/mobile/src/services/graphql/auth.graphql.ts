import {gql} from '@apollo/client';

// Session fragment
export const SESSION_FRAGMENT = gql`
  fragment SessionFragment on Session {
    access_token
    refresh_token
    expires_in
    expires_at
  }
`;

// Auth user fragment
export const AUTH_USER_FRAGMENT = gql`
  fragment AuthUserFragment on AuthUser {
    id
    firstName
    lastName
    email
    hasCompletedSetup
    notificationPermission
  }
`;

// Auth response fragment
export const AUTH_RESPONSE_FRAGMENT = gql`
  fragment AuthResponseFragment on AuthResponse {
    user {
      ...AuthUserFragment
    }
    session {
      ...SessionFragment
    }
  }
  ${AUTH_USER_FRAGMENT}
  ${SESSION_FRAGMENT}
`;

// Sign up mutation
export const SIGN_UP = gql`
  mutation SignUp($input: SignUpInput!) {
    signUp(input: $input) {
      ...AuthResponseFragment
    }
  }
  ${AUTH_RESPONSE_FRAGMENT}
`;

// Sign in mutation
export const SIGN_IN = gql`
  mutation SignIn($input: SignInInput!) {
    signIn(input: $input) {
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

// Reset password mutation
export const RESET_PASSWORD = gql`
  mutation ResetPassword($input: ResetPasswordInput!) {
    resetPassword(input: $input)
  }
`;

// Update password mutation
export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($input: UpdatePasswordInput!) {
    updatePassword(input: $input)
  }
`;

// Update notification permission mutation
export const UPDATE_NOTIFICATION_PERMISSION = gql`
  mutation UpdateNotificationPermission(
    $input: UpdateNotificationPermissionInput!
  ) {
    updateNotificationPermission(input: $input)
  }
`;
