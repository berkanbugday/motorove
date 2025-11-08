import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_EVENT,
  GET_EVENT,
  GET_EVENTS,
  UPDATE_EVENT,
  GET_EVENT_INVITATIONS,
  ACCEPT_EVENT_INVITATION,
  REJECT_EVENT_INVITATION,
  REMOVE_EVENT,
  JOIN_EVENT,
  LEAVE_EVENT,
  CANCEL_EVENT,
} from './graphql/event.graphql';
import {loggingService} from './logging.service';
import {useState, useCallback, useEffect, useRef} from 'react';
import {useTranslation} from '@hooks/useTranslation';
import {showToast} from '@components';
import {
  ICreateEvent,
  IEvent,
  IUpdateEvent,
  EventStatus,
} from '@motorove/shared';

// Hook for creating an event
export const useCreateEvent = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createEventMutation, {loading, error}] = useMutation(CREATE_EVENT, {
    onCompleted: data => {
      if (data?.createEvent?.status === EventStatus.DRAFT) {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.event.draft_saved'),
        });
      } else {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.event.event_created'),
        });
      }

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error creating event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.event_created_failed'),
      });
    },
  });

  const createEvent = async (input: ICreateEvent) => {
    try {
      // Format the data for the API
      const formattedData = {
        title: input.title,
        description: input.description,
        addresses: input.addresses,
        startDateTime: input.startDateTime,
        endDateTime: input.endDateTime,
        maxParticipants: input.maxParticipants,
        images: input.images,
        isPrivate: input.isPrivate,
        eventType: input.eventType,
        status: input.status,
        invitedGroupIds: input.invitedGroupIds,
        invitedUserIds: input.invitedUserIds,
        organizedByGroupId: input.organizedByGroupId,
        // Include specific fields based on event type
        ...(input.routeDescription && {
          routeDescription: input.routeDescription,
        }),
        ...(input.roadType && {roadType: input.roadType}),
        ...(input.difficultyLevel && {
          difficultyLevel: input.difficultyLevel,
        }),
        ...(input.restStops && {restStops: input.restStops}),
        ...(input.campingInfo && {
          campingInfo: input.campingInfo,
        }),
        ...(input.equipmentChecklist && {
          equipmentChecklist: input.equipmentChecklist,
        }),
        ...(input.instructorInfo && {
          instructorInfo: input.instructorInfo,
        }),
        ...(input.topicsCovered && {
          topicsCovered: input.topicsCovered,
        }),
        ...(input.experienceLevel && {
          experienceLevel: input.experienceLevel,
        }),
        ...(input.price && {price: input.price}),
        ...(input.price && input.currency && {currency: input.currency}),
      };

      const result = await createEventMutation({
        variables: {
          input: formattedData,
        },
      });

      return result.data?.createEvent as IEvent;
    } catch (err) {
      loggingService.error('Error in createEvent:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createEvent,
    loading,
    error,
  };
};

// Hook for updating an event
export const useUpdateEvent = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateEventMutation, {loading, error}] = useMutation(UPDATE_EVENT, {
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.success_updated_event'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error updating event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.error_updating_event'),
      });
    },
  });

  const updateEvent = async (input: IUpdateEvent): Promise<IEvent | null> => {
    try {
      const result = await updateEventMutation({
        variables: {
          input,
        },
      });
      return result.data?.updateEvent as IEvent;
    } catch (err) {
      loggingService.error('Error in updateEvent:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateEvent,
    loading,
    error,
  };
};

// Hook for removing an event
export const useRemoveEvent = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeEventMutation, {loading, error}] = useMutation(REMOVE_EVENT, {
    update: (cache, {data}) => {
      if (!data?.removeEvent) {
        return;
      }

      const removedEventId = data.removeEvent;

      try {
        // First, update all GET_EVENTS queries to remove the deleted event
        // This must be done BEFORE evicting to avoid reference errors
        cache.modify({
          fields: {
            events(existingEventRefs = [], {readField, canRead}) {
              return existingEventRefs.filter((eventRef: any) => {
                // Use canRead to check if the reference is valid and in the store
                if (!canRead(eventRef)) {
                  loggingService.debug(
                    'Filtering invalid event reference from cache',
                    {eventRef},
                  );
                  return false;
                }
                
                // Check if this is the event we want to remove
                const id = readField('id', eventRef);
                return id !== removedEventId;
              });
            },
          },
        });

        // Then, evict the event from cache
        const cacheId = cache.identify({
          __typename: 'EventDto',
          id: removedEventId,
        });

        if (cacheId) {
          cache.evict({id: cacheId});
        }

        // Clean up any dangling references
        cache.gc();
      } catch (cacheError) {
        loggingService.error(
          'Error updating cache after event removal:',
          cacheError,
        );
      }
    },
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.event_deleted'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error removing event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.event_deleted_failed'),
      });
    },
  });

  const removeEvent = async (id: string) => {
    try {
      const result = await removeEventMutation({
        variables: {id},
      });
      return result.data?.removeEvent;
    } catch (err) {
      loggingService.error('Error in removeEvent:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removeEvent,
    loading,
    error,
  };
};

// Hook for canceling an event
export const useCancelEvent = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [cancelEventMutation, {loading, error}] = useMutation(CANCEL_EVENT, {
    update: (cache, {data}) => {
      if (!data?.cancelEvent) {
        return;
      }

      const cancelledEventId = data.cancelEvent;

      try {
        // First, update all GET_EVENTS queries to remove the cancelled event
        // This must be done BEFORE evicting to avoid reference errors
        cache.modify({
          fields: {
            events(existingEventRefs = [], {readField, canRead}) {
              return existingEventRefs.filter((eventRef: any) => {
                // Use canRead to check if the reference is valid and in the store
                if (!canRead(eventRef)) {
                  loggingService.debug(
                    'Filtering invalid event reference from cache',
                    {eventRef},
                  );
                  return false;
                }
                
                // Check if this is the event we want to remove
                const id = readField('id', eventRef);
                return id !== cancelledEventId;
              });
            },
          },
        });

        // Then, evict the event from cache
        const cacheId = cache.identify({
          __typename: 'EventDto',
          id: cancelledEventId,
        });

        if (cacheId) {
          cache.evict({id: cacheId});
        }

        // Clean up any dangling references
        cache.gc();
      } catch (cacheError) {
        loggingService.error(
          'Error updating cache after event cancellation:',
          cacheError,
        );
      }
    },
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.cancelled_successfully'),
      });
      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error canceling event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.cancelled_failed'),
      });
    },
  });

  const cancelEvent = useCallback(
    async (eventId: string) => {
      try {
        const result = await cancelEventMutation({variables: {id: eventId}});
        return result.data?.cancelEvent;
      } catch (errorObj) {
        loggingService.error('Error canceling event:', errorObj);
      }
    },
    [cancelEventMutation],
  );

  return {
    cancelEvent,
    loading,
    error,
  };
};

// Hook for getting a specific event
export const useGetEvent = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_EVENT, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching event:', errorObj);
    },
  });

  return {
    event: data?.event as IEvent | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting all events with race condition protection
export const useGetEvents = (
  limit = 20,
  skip = 0,
  status?: EventStatus,
  groupId?: string,
) => {
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const currentStatusRef = useRef<EventStatus | undefined>(status);
  const loadMoreAbortControllerRef = useRef<AbortController | null>(null);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_EVENTS, {
    variables: {
      limit,
      skip,
      status,
      groupId,
    },
    onError: errorObj => {
      loggingService.error('Error fetching all events:', errorObj);
    },
  });

  // Cancel ongoing requests when status changes
  useEffect(() => {
    if (currentStatusRef.current !== status) {
      // Cancel any ongoing loadMore request
      if (loadMoreAbortControllerRef.current) {
        loadMoreAbortControllerRef.current.abort();
        loadMoreAbortControllerRef.current = null;
        setIsFetchingMore(false);
      }

      currentStatusRef.current = status;
    }
  }, [status]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
      if (loadMoreAbortControllerRef.current) {
        loadMoreAbortControllerRef.current.abort();
      }
    };
  }, []);

  // Wrap the original refetch to reset state and cancel ongoing requests
  const refetch = useCallback(async () => {
    // Cancel any ongoing loadMore request
    if (loadMoreAbortControllerRef.current) {
      loadMoreAbortControllerRef.current.abort();
      loadMoreAbortControllerRef.current = null;
    }
    setIsFetchingMore(false);

    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    // Prevent multiple concurrent loadMore requests
    if (isFetchingMore || loading) {
      return;
    }

    // Check if status has changed since this callback was created
    if (currentStatusRef.current !== status) {
      return;
    }

    // Cancel any existing loadMore request
    if (loadMoreAbortControllerRef.current) {
      loadMoreAbortControllerRef.current.abort();
    }

    // Create new abort controller for this request
    loadMoreAbortControllerRef.current = new AbortController();
    const currentAbortController = loadMoreAbortControllerRef.current;

    setIsFetchingMore(true);

    try {
      await fetchMore({
        variables: {
          skip: data?.events?.length || 0,
          limit,
          status,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          // Check if this request was aborted
          if (currentAbortController.signal.aborted) {
            return prev;
          }

          // Check if status has changed during the request
          if (currentStatusRef.current !== status) {
            return prev;
          }

          if (!fetchMoreResult || !fetchMoreResult.events) {
            return prev;
          }

          const prevEvents = prev?.events || [];
          // Create a Set of existing event IDs to prevent duplicates
          const existingIds = new Set(prevEvents.map((event: any) => event.id));

          // Filter out any events that already exist
          const newEvents = fetchMoreResult.events.filter(
            (event: any) => !existingIds.has(event.id),
          );

          return {
            events: [...prevEvents, ...newEvents],
          };
        },
      });
    } catch (errorObj: any) {
      setIsFetchingMore(false);
      // Don't log errors for aborted requests
      if (
        errorObj.name !== 'AbortError' &&
        !currentAbortController.signal.aborted
      ) {
        loggingService.error('Error loading more events:', errorObj);
      }
    } finally {
      // Only reset loading state if this is still the current request
      if (loadMoreAbortControllerRef.current === currentAbortController) {
        setIsFetchingMore(false);
        loadMoreAbortControllerRef.current = null;
      }
    }
  }, [data?.events?.length, fetchMore, isFetchingMore, limit, loading, status]);

  return {
    events: (data?.events as IEvent[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    isFetchingMore,
  };
};

// Hook to fetch event invitations
export const useGetEventInvitations = (limit = 20, skip = 0) => {
  const {t} = useTranslation();
  const [isFetchingMore, setIsFetchingMore] = useState(false);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_EVENT_INVITATIONS, {
    variables: {limit, skip},
    onError: errorObj => {
      loggingService.error('Error fetching event invitations:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setIsFetchingMore(false);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (isFetchingMore || loading) {
      return;
    }

    setIsFetchingMore(true);
    try {
      const result = await fetchMore({
        variables: {
          skip: data?.eventInvitations?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          const prevInvitations = prev?.eventInvitations || [];

          // Create a Set of existing invitation IDs to prevent duplicates
          const existingIds = new Set(
            prevInvitations.map((invitation: any) => invitation.id),
          );

          // Filter out any invitations that already exist
          const newInvitations = fetchMoreResult.eventInvitations.filter(
            (invitation: any) => !existingIds.has(invitation.id),
          );

          return {
            eventInvitations: [...prevInvitations, ...newInvitations],
          };
        },
      });

      if (result.data.eventInvitations.length < limit) {
      }
    } catch (errorObj) {
      setIsFetchingMore(false);
      loggingService.error('Error loading more invitations:', errorObj);
    } finally {
      setIsFetchingMore(false);
    }
  }, [
    data?.eventInvitations?.length,
    fetchMore,
    isFetchingMore,
    limit,
    loading,
  ]);

  const [acceptMutation] = useMutation(ACCEPT_EVENT_INVITATION, {
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.eventInvitation.invitation_accepted'),
      });
      refetch();
    },
    onError: errorObj => {
      loggingService.error('Error accepting invitation:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.eventInvitation.error_accepting'),
      });
    },
  });

  const [rejectMutation] = useMutation(REJECT_EVENT_INVITATION, {
    onCompleted: () => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.eventInvitation.invitation_rejected'),
      });
      refetch();
    },
    onError: errorObj => {
      loggingService.error('Error rejecting invitation:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.eventInvitation.error_rejecting'),
      });
    },
  });

  const handleAccept = useCallback(
    (invitationId: string) => {
      acceptMutation({variables: {id: invitationId}});
    },
    [acceptMutation],
  );

  const handleReject = useCallback(
    (invitationId: string) => {
      rejectMutation({variables: {id: invitationId}});
    },
    [rejectMutation],
  );

  return {
    invitations: data?.eventInvitations || [],
    loading,
    error,
    refetch,
    loadMore,
    isFetchingMore,
    handleAccept,
    handleReject,
  };
};

// Hook for joining an event
export const useJoinEvent = (onSuccess?: (event: IEvent) => void) => {
  const {t} = useTranslation();
  const [joinEventMutation, {loading, error}] = useMutation(JOIN_EVENT, {
    onCompleted: data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.joined_successfully'),
      });
      if (onSuccess && data?.joinEvent) {
        onSuccess(data.joinEvent);
      }
    },
    onError: errorObj => {
      loggingService.error('Error joining event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.join_failed'),
      });
    },
  });

  const joinEvent = useCallback(
    async (eventId: string) => {
      try {
        const result = await joinEventMutation({variables: {id: eventId}});
        return result.data?.joinEvent;
      } catch (errorObj) {
        loggingService.error('Error joining event:', errorObj);
      }
    },
    [joinEventMutation],
  );

  return {
    joinEvent,
    loading,
    error,
  };
};

// Hook for leaving an event
export const useLeaveEvent = (onSuccess?: (event: IEvent) => void) => {
  const {t} = useTranslation();
  const [leaveEventMutation, {loading, error}] = useMutation(LEAVE_EVENT, {
    onCompleted: data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.event.left_successfully'),
      });
      if (onSuccess && data?.leaveEvent) {
        onSuccess(data.leaveEvent);
      }
    },
    onError: errorObj => {
      loggingService.error('Error leaving event:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.event.leave_failed'),
      });
    },
  });

  const leaveEvent = useCallback(
    async (eventId: string) => {
      try {
        const result = await leaveEventMutation({variables: {id: eventId}});
        return result.data?.leaveEvent;
      } catch (errorObj) {
        loggingService.error('Error leaving event:', errorObj);
      }
    },
    [leaveEventMutation],
  );

  return {
    leaveEvent,
    loading,
    error,
  };
};

// Export as EventService object
export const EventService = {
  useCreateEvent,
  useUpdateEvent,
  useGetEvent,
  useGetEvents,
  useGetEventInvitations,
};

export default EventService;
