import {useQuery} from '@apollo/client';
import {
  GET_GROUP_PRIVACY_OPTIONS,
  GET_GROUP_MEMBER_ROLES,
} from './graphql/enum.graphql';
import {toPascalCase} from '@utils/stringUtils';

// Type definitions
export interface EnumItem {
  key: string;
  value: string;
}

export interface DropdownItem {
  id: number;
  label: string;
  value: string;
}

export const useEnumPrivacyOptions = () => {
  const {data, loading, error} = useQuery(GET_GROUP_PRIVACY_OPTIONS);

  const privacyOptions: DropdownItem[] = data?.getGroupPrivacyOptions
    ? data.getGroupPrivacyOptions.map((privacy: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(privacy.value),
        value: privacy.value,
      }))
    : [];

  return {privacyOptions, loading, error};
};

export const useEnumGroupMemberRoles = () => {
  const {data, loading, error} = useQuery(GET_GROUP_MEMBER_ROLES);

  const memberRoles: DropdownItem[] = data?.getGroupMemberRoles
    ? data.getGroupMemberRoles.map((role: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(role.value),
        value: role.value,
      }))
    : [];

  return {memberRoles, loading, error};
};

// Export all as EnumService object
export const EnumService = {
  useEnumPrivacyOptions,
  useEnumGroupMemberRoles,
};

export default EnumService;
