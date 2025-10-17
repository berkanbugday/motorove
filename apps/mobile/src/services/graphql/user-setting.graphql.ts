import {gql} from '@apollo/client';

// Auth user fragment
export const USER_SETTING_FRAGMENT = gql`
  fragment UserSettingFragment on UserSettingDto {
    autoAcceptFollowers
    preferredLanguage
    notificationPermission
    notificationPreferences
  }
`;

// User setting queries
export const GET_USER_SETTING = gql`
  query GetUserSetting {
    userSetting {
      ...UserSettingFragment
    }
  }
  ${USER_SETTING_FRAGMENT}
`;

// Update user setting mutation
export const UPDATE_USER_SETTING = gql`
  mutation UpdateUserSetting($input: UpdateUserSettingInput!) {
    updateUserSetting(input: $input) {
      ...UserSettingFragment
    }
  }
  ${USER_SETTING_FRAGMENT}
`;
