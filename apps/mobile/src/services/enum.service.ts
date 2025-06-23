import {useQuery} from '@apollo/client';
import {
  GET_GROUP_PRIVACY_OPTIONS,
  GET_GROUP_MEMBER_ROLES,
  GET_EVENT_TYPES,
  GET_ROAD_TYPES,
  GET_DIFFICULTY_LEVELS,
  GET_EXPERIENCE_LEVELS,
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

  const groupMemberRoles: DropdownItem[] = data?.getGroupMemberRoles
    ? data.getGroupMemberRoles.map((role: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(role.value),
        value: role.value,
      }))
    : [];

  return {groupMemberRoles, loading, error};
};

export const useEnumEventTypes = () => {
  const {data, loading, error} = useQuery(GET_EVENT_TYPES);

  const eventTypes: DropdownItem[] = data?.getEventTypes
    ? data.getEventTypes.map((type: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(type.value),
        value: type.value,
      }))
    : [];

  return {eventTypes, loading, error};
};

export const useEnumRoadTypes = () => {
  const {data, loading, error} = useQuery(GET_ROAD_TYPES);

  const roadTypes: DropdownItem[] = data?.getRoadTypes
    ? data.getRoadTypes.map((type: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(type.value),
        value: type.value,
      }))
    : [];

  return {roadTypes, loading, error};
};

export const useEnumDifficultyLevels = () => {
  const {data, loading, error} = useQuery(GET_DIFFICULTY_LEVELS);

  const difficultyLevels: DropdownItem[] = data?.getDifficultyLevels
    ? data.getDifficultyLevels.map((level: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(level.value),
        value: level.value,
      }))
    : [];

  return {difficultyLevels, loading, error};
};

export const useEnumExperienceLevels = () => {
  const {data, loading, error} = useQuery(GET_EXPERIENCE_LEVELS);

  const experienceLevels: DropdownItem[] = data?.getExperienceLevels
    ? data.getExperienceLevels.map((level: EnumItem, index: number) => ({
        id: index + 1,
        label: toPascalCase(level.value),
        value: level.value,
      }))
    : [];

  return {experienceLevels, loading, error};
};

// Export all as EnumService object
export const EnumService = {
  useEnumPrivacyOptions,
  useEnumGroupMemberRoles,
  useEnumEventTypes,
  useEnumRoadTypes,
  useEnumDifficultyLevels,
  useEnumExperienceLevels,
};

export default EnumService;
