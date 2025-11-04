import {useCallback} from 'react';
import {
  IBaseCreateAddress,
  ICreateEventAddress,
  AddressType,
} from '@motorove/shared';

interface UseEventLocationsProps {
  setValue: (name: string, value: any, options?: any) => void;
  setSelectedMeetingLocation: (addresses: ICreateEventAddress[] | null) => void;
  setSelectedStartLocation: (addresses: ICreateEventAddress[] | null) => void;
  setSelectedFinishLocation: (addresses: ICreateEventAddress[] | null) => void;
  language: string;
}

export const useEventLocations = ({
  setValue,
  setSelectedMeetingLocation,
  setSelectedStartLocation,
  setSelectedFinishLocation,
  language,
}: UseEventLocationsProps) => {
  const handleMeetingLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        setSelectedMeetingLocation(null);
        setValue('meetingLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_MEETING_LOCATION,
      }));
      setSelectedMeetingLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      setValue('meetingLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, language, setSelectedMeetingLocation],
  );

  const handleStartLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        setSelectedStartLocation(null);
        setValue('startLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_START_LOCATION,
      }));
      setSelectedStartLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      setValue('startLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, language, setSelectedStartLocation],
  );

  const handleFinishLocationSelect = useCallback(
    (addresses: IBaseCreateAddress[]) => {
      if (addresses.length === 0) {
        setSelectedFinishLocation(null);
        setValue('finishLocation', '', {
          shouldValidate: true,
          shouldDirty: true,
        });
        return;
      }

      const addressesWithTypes = addresses.map(addr => ({
        ...addr,
        type: AddressType.EVENT_FINISH_LOCATION,
      }));
      setSelectedFinishLocation(addressesWithTypes);

      const displayAddress = addresses.find(
        addr => addr.language.toLowerCase() === language.toLowerCase(),
      );

      setValue('finishLocation', displayAddress?.address || '', {
        shouldValidate: true,
        shouldDirty: true,
      });
    },
    [setValue, language, setSelectedFinishLocation],
  );

  return {
    handleMeetingLocationSelect,
    handleStartLocationSelect,
    handleFinishLocationSelect,
  };
};
