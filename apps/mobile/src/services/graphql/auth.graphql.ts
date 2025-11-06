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
    avatar
    hasCompletedSetup
    notificationPermission
    preferredLanguage
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

// Sign out mutation
export const SIGN_OUT = gql`
  mutation SignOut {
    signOut
  }
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

// Update email mutation
export const UPDATE_EMAIL = gql`
  mutation UpdateEmail($input: UpdateEmailInput!) {
    updateEmail(input: $input)
  }
`;

// Update password mutation
export const UPDATE_PASSWORD = gql`
  mutation UpdatePassword($newPassword: String!) {
    updatePassword(newPassword: $newPassword)
  }
`;

export const RESEND = gql`
  mutation Resend($email: String!) {
    resend(email: $email)
  }
`;
