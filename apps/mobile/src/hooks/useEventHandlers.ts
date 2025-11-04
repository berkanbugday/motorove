import {useCallback} from 'react';
import {DropdownItem} from '@components';

interface UseEventHandlersProps {
  setValue: (name: string, value: any, options?: any) => void;
  setSelectedEventType: (item: DropdownItem | null) => void;
  setSelectedRoadType: (item: DropdownItem | null) => void;
  setSelectedDifficultyLevel: (item: DropdownItem | null) => void;
  setSelectedExperienceLevel: (item: DropdownItem | null) => void;
  setSelectedCurrency: (item: DropdownItem | null) => void;
  setSelectedOrganizedByGroup: (item: DropdownItem | null) => void;
  setIsPrivate: (value: boolean) => void;
  setSelectedGroups: (groupIds: string[]) => void;
  setSelectedUsers: (userIds: string[]) => void;
  setActiveInviteTab: (tab: string) => void;
}

export const useEventHandlers = ({
  setValue,
  setSelectedEventType,
  setSelectedRoadType,
  setSelectedDifficultyLevel,
  setSelectedExperienceLevel,
  setSelectedCurrency,
  setSelectedOrganizedByGroup,
  setIsPrivate,
  setSelectedGroups,
  setSelectedUsers,
  setActiveInviteTab,
}: UseEventHandlersProps) => {
  const handleEventTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedEventType(item);
      setValue('eventType', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedEventType],
  );

  const handleRoadTypeSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedRoadType(item);
      setValue('roadType', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedRoadType],
  );

  const handleDifficultySelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedDifficultyLevel(item);
      setValue('difficultyLevel', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedDifficultyLevel],
  );

  const handleExperienceLevelSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedExperienceLevel(item);
      setValue('experienceLevel', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedExperienceLevel],
  );

  const handleCurrencySelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedCurrency(item);
      setValue('currency', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedCurrency],
  );

  const handleOrganizedByGroupSelect = useCallback(
    (item: DropdownItem | null) => {
      setSelectedOrganizedByGroup(item);
      setValue('organizedByGroupId', item?.value || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedOrganizedByGroup],
  );

  const togglePrivacy = useCallback(
    (newValue: boolean) => {
      setIsPrivate(newValue);
      setValue('isPrivate', newValue, {shouldValidate: true, shouldDirty: true});
    },
    [setValue, setIsPrivate],
  );

  const handleGroupsChange = useCallback(
    (groupIds: string[]) => {
      setSelectedGroups(groupIds);
      setValue('invitedGroups', groupIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedGroups],
  );

  const handleUsersChange = useCallback(
    (userIds: string[]) => {
      setSelectedUsers(userIds);
      setValue('invitedUsers', userIds, {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, setSelectedUsers],
  );

  const handleTabChange = useCallback(
    (key: string) => {
      setActiveInviteTab(key);
    },
    [setActiveInviteTab],
  );

  return {
    handleEventTypeSelect,
    handleRoadTypeSelect,
    handleDifficultySelect,
    handleExperienceLevelSelect,
    handleCurrencySelect,
    handleOrganizedByGroupSelect,
    togglePrivacy,
    handleGroupsChange,
    handleUsersChange,
    handleTabChange,
  };
};
