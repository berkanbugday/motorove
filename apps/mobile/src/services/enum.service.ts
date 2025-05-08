import {useQuery} from '@apollo/client';
import {GET_GROUP_PRIVACY_OPTIONS} from './graphql/enum.graphql';

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
        label: privacy.key,
        value: privacy.value,
      }))
    : [];

  return {privacyOptions, loading, error};
};

// Export all as EnumService object
export const EnumService = {
  useEnumPrivacyOptions,
};

export default EnumService;
