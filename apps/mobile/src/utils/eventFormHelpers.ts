import {
  ICreateEvent,
  IUpdateEvent,
  ICreateEventAddress,
  EventType,
  EventStatus,
  RoadType,
  DifficultyLevel,
  ExperienceLevel,
  Currency,
} from '@motorove/shared';
import {extractPathFromSignedUrl} from './imageUtils';

export interface EventFormData {
  title: string;
  description: string;
  eventType: string;
  maxParticipants?: string | null;
  isPrivate: boolean;
  invitedGroups: string[];
  invitedUsers: string[];
  organizedByGroupId?: string;
  startDate: Date;
  startTime: Date;
  endDate?: Date;
  endTime?: Date;
  meetingLocation?: string;
  startLocation?: string;
  finishLocation?: string;
  routeDescription?: string;
  roadType?: string;
  difficultyLevel?: string;
  restStops?: string;
  campingInfo?: string;
  equipmentChecklist?: string;
  instructorInfo?: string;
  topicsCovered?: string;
  experienceLevel?: string;
  price?: string;
  currency?: string;
}

export const cleanAddresses = (
  addresses: ICreateEventAddress[] | null | undefined,
): ICreateEventAddress[] => {
  if (!addresses || addresses.length === 0) {
    return [];
  }
  return addresses.map(addr => ({
    type: addr.type,
    latitude: addr.latitude,
    longitude: addr.longitude,
    address: addr.address,
    language: addr.language,
    countryCode: addr.countryCode,
  }));
};

export const buildEventInput = (
  formData: EventFormData,
  selectedImages: {id: number; uri: string; base64?: string}[],
  selectedMeetingLocation: ICreateEventAddress[] | null,
  selectedStartLocation: ICreateEventAddress[] | null,
  selectedFinishLocation: ICreateEventAddress[] | null,
  status: EventStatus,
): ICreateEvent => {
  const addresses: ICreateEventAddress[] = [
    ...cleanAddresses(selectedMeetingLocation),
    ...cleanAddresses(selectedStartLocation),
    ...cleanAddresses(selectedFinishLocation),
  ];

  // Extract images: send base64 for new images, extract paths from signed URLs for existing images
  // Supabase signed URLs format: https://[project].supabase.co/storage/v1/object/sign/[bucket]/[path]?token=...
  // We extract the path part to avoid re-uploading signed URLs (which would cause duplicates)
  // If extraction fails, fallback to URI so backend can process it (similar to EditPostScreen)
  const images = selectedImages
    .map(img => {
      // New image with base64 data
      if (img.base64) {
        return img.base64;
      }
      // Existing image - try to extract path from signed URL, fallback to URI if extraction fails
      return extractPathFromSignedUrl(img.uri, true) || img.uri;
    })
    .filter((img): img is string => img !== null && img !== undefined);

  const maxParticipantsValue = formData.maxParticipants
    ? parseInt(formData.maxParticipants, 10)
    : undefined;

  if (maxParticipantsValue && isNaN(maxParticipantsValue)) {
    throw new Error('Invalid maxParticipants value');
  }

  const baseInput: ICreateEvent = {
    title: formData.title,
    description: formData.description,
    isPrivate: formData.isPrivate,
    invitedGroupIds: formData.isPrivate ? formData.invitedGroups || [] : [],
    invitedUserIds: formData.isPrivate ? formData.invitedUsers || [] : [],
    organizedByGroupId:
      formData.organizedByGroupId && formData.organizedByGroupId.trim() !== ''
        ? formData.organizedByGroupId
        : undefined,
    eventType: formData.eventType as EventType,
    status,
    addresses: addresses.length > 0 ? addresses : [],
    startDateTime: new Date(
      `${formData.startDate.toISOString().split('T')[0]}T${
        formData.startTime.toISOString().split('T')[1]
      }`,
    ).toISOString(),
    endDateTime:
      formData.endDate && formData.endTime
        ? new Date(
            `${formData.endDate.toISOString().split('T')[0]}T${
              formData.endTime.toISOString().split('T')[1]
            }`,
          ).toISOString()
        : undefined,
    maxParticipants: maxParticipantsValue,
    images,
  };

  // Add optional fields only if they have values
  if (formData.roadType && formData.roadType.trim() !== '') {
    baseInput.roadType = formData.roadType as RoadType;
  }
  if (formData.difficultyLevel && formData.difficultyLevel.trim() !== '') {
    baseInput.difficultyLevel = formData.difficultyLevel as DifficultyLevel;
  }
  if (formData.experienceLevel && formData.experienceLevel.trim() !== '') {
    baseInput.experienceLevel = formData.experienceLevel as ExperienceLevel;
  }
  if (formData.routeDescription && formData.routeDescription.trim() !== '') {
    baseInput.routeDescription = formData.routeDescription;
  }
  if (formData.restStops && formData.restStops.trim() !== '') {
    baseInput.restStops = formData.restStops;
  }
  if (formData.campingInfo && formData.campingInfo.trim() !== '') {
    baseInput.campingInfo = formData.campingInfo;
  }
  if (
    formData.equipmentChecklist &&
    formData.equipmentChecklist.trim() !== ''
  ) {
    baseInput.equipmentChecklist = formData.equipmentChecklist;
  }
  if (formData.instructorInfo && formData.instructorInfo.trim() !== '') {
    baseInput.instructorInfo = formData.instructorInfo;
  }
  if (formData.topicsCovered && formData.topicsCovered.trim() !== '') {
    baseInput.topicsCovered = formData.topicsCovered;
  }
  if (formData.price && formData.price.trim() !== '') {
    baseInput.price = formData.price;
  }
  if (formData.currency && formData.currency.trim() !== '') {
    baseInput.currency = formData.currency as Currency;
  }

  return baseInput;
};

export const buildUpdateEventInput = (
  eventId: string,
  formData: EventFormData,
  selectedImages: {id: number; uri: string; base64?: string}[],
  selectedMeetingLocation: ICreateEventAddress[] | null,
  selectedStartLocation: ICreateEventAddress[] | null,
  selectedFinishLocation: ICreateEventAddress[] | null,
  selectedEventTypeValue: string | undefined,
  status: EventStatus,
): IUpdateEvent => {
  const baseInput = buildEventInput(
    formData,
    selectedImages,
    selectedMeetingLocation,
    selectedStartLocation,
    selectedFinishLocation,
    status,
  );

  return {
    id: eventId,
    ...baseInput,
    eventType: selectedEventTypeValue as EventType,
    addresses:
      baseInput.addresses && baseInput.addresses.length > 0
        ? baseInput.addresses
        : undefined,
  };
};
