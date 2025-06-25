import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_GROUP,
  GET_GROUP,
  GET_GROUPS,
  GET_JOINED_GROUPS,
  UPDATE_GROUP,
  SEARCH_GROUPS,
} from './graphql/group.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback, useEffect} from 'react';

// Type definitions
export interface CreateGroupInput {
  name: string;
  description: string;
  logo: string | null | undefined;
  cover: string | null | undefined;
  city: {id: string; value: string};
  privacy: string | undefined;
  membersCapacity: number | null;
  tags: {id: string; value: string}[];
}

export interface UpdateGroupInput extends CreateGroupInput {
  id: string;
}

export interface Group {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  cover: string | null;
  isMember: boolean;
  isAdmin: boolean;
  city: {id: string; value: string};
  privacy: string;
  memberships: {
    id: string;
    role: string;
    user: {
      id: string;
      firstName: string;
      lastName: string;
      avatar: string;
    };
  }[];
  membersCapacity: number | null;
  tags: {id: string; value: string}[];
}

export interface GroupFilters {
  city: string | null;
  tags: string[];
  privacy: 'ALL' | 'PUBLIC' | 'PRIVATE';
  role: 'ALL' | 'ADMIN' | 'MEMBER';
}

// Hook for creating a group
export const useCreateGroup = (onSuccess?: () => void) => {
  const [createGroupMutation, {loading, error}] = useMutation(CREATE_GROUP, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Group created successfully!',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error creating group:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to create group. Please try again.',
      });
    },
  });

  const createGroup = async (input: CreateGroupInput) => {
    try {
      const result = await createGroupMutation({
        variables: {
          input: {
            ...input,
            logo: input.logo ?? null,
            cover: input.cover ?? null,
          },
        },
      });
      return result.data?.createGroup;
    } catch (err) {
      loggingService.error('Error in createGroup:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createGroup,
    loading,
    error,
  };
};

// Hook for updating a group
export const useUpdateGroup = (onSuccess?: () => void) => {
  const [updateGroupMutation, {loading, error}] = useMutation(UPDATE_GROUP, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Group updated successfully!',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error updating group:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to update group. Please try again.',
      });
    },
  });

  const updateGroup = async (input: UpdateGroupInput) => {
    try {
      const result = await updateGroupMutation({
        variables: {
          input: {
            ...input,
            logo: input.logo ?? null,
            cover: input.cover ?? null,
          },
        },
      });
      return result.data?.updateGroup;
    } catch (err) {
      loggingService.error('Error in updateGroup:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateGroup,
    loading,
    error,
  };
};

// Hook for getting a specific group
export const useGetGroup = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_GROUP, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching group:', errorObj);
    },
  });

  return {
    group: data?.group as Group | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting user's groups
export const useGetJoinedGroups = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<GroupFilters>({
    city: null,
    tags: [],
    privacy: 'ALL',
    role: 'ALL',
  });

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_JOINED_GROUPS, {
    variables: {
      limit,
      skip,
      filters,
    },
    fetchPolicy: 'network-only',
    nextFetchPolicy: 'network-only',
    onError: errorObj => {
      loggingService.error('Error fetching user groups:', errorObj);
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
          skip: data?.joinedGroups?.length || 0,
          limit,
          filters,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            joinedGroups: [
              ...prev.joinedGroups,
              ...fetchMoreResult.joinedGroups,
            ],
          };
        },
      });

      if (result.data.joinedGroups.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more joined groups:', errorObj);
    }
  }, [
    data?.joinedGroups?.length,
    fetchMore,
    hasMore,
    limit,
    loading,
    filters,
    originalRefetch,
  ]);

  // Apply filters and reset pagination
  const applyFilters = useCallback((newFilters: GroupFilters) => {
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
    groups: (data?.joinedGroups as Group[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    applyFilters,
  };
};

// Hook for getting all groups
export const useGetGroups = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const [filters, setFilters] = useState<GroupFilters>({
    city: null,
    tags: [],
    privacy: 'ALL',
    role: 'ALL',
  });

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_GROUPS, {
    variables: {
      limit,
      skip,
      filters,
    },
    onError: errorObj => {
      loggingService.error('Error fetching all groups:', errorObj);
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
          skip: data?.groups?.length || 0,
          limit,
          filters,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            groups: [...prev.groups, ...fetchMoreResult.groups],
          };
        },
      });

      if (result.data.groups.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more groups:', errorObj);
    }
  }, [data?.groups?.length, fetchMore, hasMore, limit, loading, filters]);

  // Apply filters and reset pagination
  const applyFilters = useCallback((newFilters: GroupFilters) => {
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
    groups: (data?.groups as Group[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
    filters,
    applyFilters,
  };
};

// Hook for searching groups by name
export const useSearchGroups = (query: string, limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(SEARCH_GROUPS, {
    variables: {query, limit, skip},
    skip: !query || query.trim() === '',
    onError: errorObj => {
      loggingService.error('Error searching groups:', errorObj);
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
          skip: data?.groups?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          return {
            groups: [...prev.groups, ...fetchMoreResult.groups],
          };
        },
      });

      if (result.data.groups.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more search results:', errorObj);
    }
  }, [data?.groups?.length, fetchMore, hasMore, limit, loading, query]);

  return {
    groups: (data?.groups as Group[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Export as GroupService object
export const GroupService = {
  useCreateGroup,
  useGetGroup,
  useGetJoinedGroups,
  useGetGroups,
  useSearchGroups,
  useUpdateGroup,
};

export default GroupService;
