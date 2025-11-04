import {useCallback, useState, useMemo} from 'react';
import {DropdownItem} from '@components';
import {EventType, ICreateEventAddress} from '@motorove/shared';

export interface EventFormState {
  selectedEventType: DropdownItem | null;
  selectedRoadType: DropdownItem | null;
  selectedDifficultyLevel: DropdownItem | null;
  selectedExperienceLevel: DropdownItem | null;
  selectedCurrency: DropdownItem | null;
  selectedOrganizedByGroup: DropdownItem | null;
  selectedImages: {id: number; uri: string; base64?: string}[];
  isPrivate: boolean;
  selectedGroups: string[];
  selectedUsers: string[];
  selectedMeetingLocation: ICreateEventAddress[] | null;
  selectedStartLocation: ICreateEventAddress[] | null;
  selectedFinishLocation: ICreateEventAddress[] | null;
  activeInviteTab: string;
}

export const useEventForm = () => {
  const [selectedEventType, setSelectedEventType] =
    useState<DropdownItem | null>(null);
  const [selectedRoadType, setSelectedRoadType] = useState<DropdownItem | null>(
    null,
  );
  const [selectedDifficultyLevel, setSelectedDifficultyLevel] =
    useState<DropdownItem | null>(null);
  const [selectedExperienceLevel, setSelectedExperienceLevel] =
    useState<DropdownItem | null>(null);
  const [selectedCurrency, setSelectedCurrency] = useState<DropdownItem | null>(
    null,
  );
  const [selectedOrganizedByGroup, setSelectedOrganizedByGroup] =
    useState<DropdownItem | null>(null);
  const [selectedImages, setSelectedImages] = useState<
    {id: number; uri: string; base64?: string}[]
  >([]);
  const [isPrivate, setIsPrivate] = useState(false);
  const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [selectedMeetingLocation, setSelectedMeetingLocation] = useState<
    ICreateEventAddress[] | null
  >(null);
  const [selectedStartLocation, setSelectedStartLocation] = useState<
    ICreateEventAddress[] | null
  >(null);
  const [selectedFinishLocation, setSelectedFinishLocation] = useState<
    ICreateEventAddress[] | null
  >(null);
  const [activeInviteTab, setActiveInviteTab] = useState<string>('users');

  // Memoized derived values
  const eventType = selectedEventType?.value as EventType | undefined;

  const isSoloRide = useMemo(
    () => eventType === EventType.SOLO_RIDE,
    [eventType],
  );

  const isRideOrCamping = useMemo(
    () =>
      [
        EventType.SOLO_RIDE,
        EventType.GROUP_RIDE,
        EventType.CAMPING_RIDE,
        EventType.SOCIAL_RESPONSIBILITY,
      ].includes(eventType || ('' as EventType)),
    [eventType],
  );

  const isWorkshop = useMemo(
    () => eventType === EventType.TRAINING,
    [eventType],
  );

  const shouldShowEventDetails = useMemo(
    () => isRideOrCamping || isWorkshop,
    [isRideOrCamping, isWorkshop],
  );

  const resetEventTypeSpecificFields = useCallback(() => {
    setSelectedRoadType(null);
    setSelectedDifficultyLevel(null);
    setSelectedExperienceLevel(null);
    setSelectedCurrency(null);
    setSelectedStartLocation(null);
    setSelectedFinishLocation(null);
  }, []);

  return {
    // State
    selectedEventType,
    selectedRoadType,
    selectedDifficultyLevel,
    selectedExperienceLevel,
    selectedCurrency,
    selectedOrganizedByGroup,
    selectedImages,
    isPrivate,
    selectedGroups,
    selectedUsers,
    selectedMeetingLocation,
    selectedStartLocation,
    selectedFinishLocation,
    activeInviteTab,
    // Setters
    setSelectedEventType,
    setSelectedRoadType,
    setSelectedDifficultyLevel,
    setSelectedExperienceLevel,
    setSelectedCurrency,
    setSelectedOrganizedByGroup,
    setSelectedImages,
    setIsPrivate,
    setSelectedGroups,
    setSelectedUsers,
    setSelectedMeetingLocation,
    setSelectedStartLocation,
    setSelectedFinishLocation,
    setActiveInviteTab,
    // Derived values
    eventType,
    isSoloRide,
    isRideOrCamping,
    isWorkshop,
    shouldShowEventDetails,
    // Helpers
    resetEventTypeSpecificFields,
  };
};
