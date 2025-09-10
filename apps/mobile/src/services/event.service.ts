import {useMutation, useQuery} from '@apollo/client';
import {apolloClient} from '../configs/apolloClientConfig';
import {
  CREATE_EVENT,
  GET_EVENT,
  GET_EVENTS,
  GET_MY_EVENTS,
  UPDATE_EVENT,
  SEARCH_EVENTS,
  INVITE_USERS_TO_EVENT,
  GET_EVENT_JOIN_REQUESTS,
  ACCEPT_EVENT_JOIN_REQUEST,
  REJECT_EVENT_JOIN_REQUEST,
} from './graphql/event.graphql';
import {loggingService} from './logging.service';
import {useState, useCallback, useEffect} from 'react';
import {useTranslation} from '@hooks/useTranslation';
import {showToast} from '@components';
import {
  ICreateEvent,
  IEvent,
  IUpdateEvent,
  IEventFilter,
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

// Function to invite users to an event
export const inviteUsersToEvent = async (
  eventId: string,
  userIds: string[],
): Promise<any> => {
  try {
    const {data} = await apolloClient.mutate({
      mutation: INVITE_USERS_TO_EVENT,
      variables: {
        input: {
          eventId,
          userIds,
        },
      },
    });
    return data?.inviteUsersToEvent;
  } catch (error) {
    loggingService.error('Error inviting users to event:', error);
    return null;
  }
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

// Hook for getting user's events
export const useGetMyEvents = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<IEventFilter>({
    eventType: undefined,
    startDateFrom: undefined,
    startDateTo: undefined,
    isPrivate: undefined,
  });

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_MY_EVENTS, {
    variables: {
      limit,
      skip,
      filters,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error fetching user events:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      // First refetch current data to ensure we have the latest
      await originalRefetch();

      const result = await fetchMore({
        variables: {
          skip: data?.myEvents?.length || 0,
          limit,
          filters,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            myEvents: [...prev.myEvents, ...fetchMoreResult.myEvents],
          };
        },
      });

      if (result.data.myEvents.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more events:', errorObj);
    }
  }, [
    data?.myEvents?.length,
    fetchMore,
    hasMore,
    limit,
    loading,
    filters,
    originalRefetch,
  ]);

  // Apply filters and reset pagination
  const applyFilters = useCallback((newFilters: IEventFilter) => {
    setFilters(newFilters);
    setHasMore(true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    originalRefetch({
      limit,
      skip: 0,
      filters,
    });
  }, [filters, limit, originalRefetch]);

  return {
    events: (data?.myEvents as IEvent[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    applyFilters,
  };
};

// Hook for getting all events
export const useGetEvents = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<IEventFilter>({
    eventType: undefined,
    startDateFrom: undefined,
    startDateTo: undefined,
    isPrivate: undefined,
  });

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
      filters,
    },
    onError: errorObj => {
      loggingService.error('Error fetching all events:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      const result = await fetchMore({
        variables: {
          skip: data?.events?.length || 0,
          limit,
          filters,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            events: [...prev.events, ...fetchMoreResult.events],
          };
        },
      });

      if (result.data.events.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more events:', errorObj);
    }
  }, [data?.events?.length, fetchMore, hasMore, limit, loading, filters]);

  // Apply filters and reset pagination
  const applyFilters = useCallback((newFilters: IEventFilter) => {
    setFilters(newFilters);
    setHasMore(true);
  }, []);

  // Refetch when filters change
  useEffect(() => {
    originalRefetch({
      limit,
      skip: 0,
      filters,
    });
  }, [filters, limit, originalRefetch]);

  return {
    events: (data?.events as IEvent[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    applyFilters,
  };
};

// Hook for searching events by title
export const useSearchEvents = (query: string, limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(SEARCH_EVENTS, {
    variables: {query, limit, skip},
    skip: !query || query.trim() === '',
    onError: errorObj => {
      loggingService.error('Error searching events:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading || !query) {
      return;
    }

    try {
      const result = await fetchMore({
        variables: {
          query,
          skip: data?.events?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            events: [...prev.events, ...fetchMoreResult.events],
          };
        },
      });

      if (result.data.events.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more search results:', errorObj);
    }
  }, [data?.events?.length, fetchMore, hasMore, limit, loading, query]);

  return {
    events: (data?.events as IEvent[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook to fetch event join requests
export const useGetEventJoinRequests = (
  eventId: string,
  limit = 20,
  skip = 0,
) => {
  const {t} = useTranslation();
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_EVENT_JOIN_REQUESTS, {
    variables: {eventId, limit, skip},
    skip: !eventId,
    onError: errorObj => {
      loggingService.error('Error fetching event join requests:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) {
      return;
    }

    try {
      const result = await fetchMore({
        variables: {
          eventId,
          skip: data?.eventJoinRequests?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            eventJoinRequests: [
              ...prev.eventJoinRequests,
              ...fetchMoreResult.eventJoinRequests,
            ],
          };
        },
      });

      if (result.data.eventJoinRequests.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more join requests:', errorObj);
    }
  }, [
    data?.eventJoinRequests?.length,
    fetchMore,
    hasMore,
    limit,
    loading,
    eventId,
  ]);

  const handleAccept = useCallback(
    async (requestId: string) => {
      try {
        const [acceptEventJoinRequest] = useMutation(
          ACCEPT_EVENT_JOIN_REQUEST,
          {
            variables: {id: requestId},
            onCompleted: () => {
              showToast({
                type: 'success',
                text1: t('common.success'),
                text2: t('screens.joinRequest.request_accepted'),
              });
              refetch();
            },
            onError: errorObj => {
              loggingService.error('Error accepting join request:', errorObj);
              showToast({
                type: 'error',
                text1: t('common.error'),
                text2:
                  errorObj.message || t('screens.joinRequest.error_accepting'),
              });
            },
          },
        );
        await acceptEventJoinRequest();
      } catch (error) {
        loggingService.error('Error accepting join request:', error);
      }
    },
    [t, refetch],
  );

  const handleReject = useCallback(
    async (requestId: string) => {
      try {
        const [rejectEventJoinRequest] = useMutation(
          REJECT_EVENT_JOIN_REQUEST,
          {
            variables: {id: requestId},
            onCompleted: () => {
              showToast({
                type: 'success',
                text1: t('common.success'),
                text2: t('screens.joinRequest.request_rejected'),
              });
              refetch();
            },
            onError: errorObj => {
              loggingService.error('Error rejecting join request:', errorObj);
              showToast({
                type: 'error',
                text1: t('common.error'),
                text2:
                  errorObj.message || t('screens.joinRequest.error_rejecting'),
              });
            },
          },
        );
      } catch (error) {
        loggingService.error('Error rejecting join request:', error);
      }
    },
    [t, refetch],
  );

  return {
    joinRequests: data?.eventJoinRequests || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    handleAccept,
    handleReject,
  };
};

// Direct mutation function for creating events (for use outside of React components)
export const createEvent = async (input: any): Promise<any> => {
  try {
    const {data} = await apolloClient.mutate({
      mutation: CREATE_EVENT,
      variables: {
        input: input,
      },
    });
    return data?.createEvent;
  } catch (error) {
    loggingService.error('Error creating event:', error);
    throw error;
  }
};

// Export as EventService object
export const EventService = {
  useCreateEvent,
  useUpdateEvent,
  useGetEvent,
  useGetMyEvents,
  useGetEvents,
  useSearchEvents,
  useGetEventJoinRequests,
  inviteUsersToEvent,
  createEvent, // Add direct mutation function
};

export default EventService;
