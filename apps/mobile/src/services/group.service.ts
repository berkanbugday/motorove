import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_GROUP,
  GET_GROUP,
  GET_GROUPS,
  GET_JOINED_GROUPS,
  UPDATE_GROUP,
} from './graphql/group.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';

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
  const {data, loading, error, refetch, fetchMore} = useQuery(
    GET_JOINED_GROUPS,
    {
      variables: {limit, skip},
      onError: errorObj => {
        loggingService.error('Error fetching user groups:', errorObj);
      },
    },
  );

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const result = await fetchMore({
        variables: {
          skip: data?.joinedGroups?.length || 0,
          limit,
        },
      });

      if (result.data.joinedGroups.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      loggingService.error('Error loading more joined groups:', error);
    }
  }, [data?.joinedGroups?.length, fetchMore, hasMore, limit, loading]);

  return {
    groups: (data?.joinedGroups as Group[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for getting all groups
export const useGetGroups = (limit = 20, skip = 0) => {
  const [hasMore, setHasMore] = useState(true);
  const {data, loading, error, refetch, fetchMore} = useQuery(GET_GROUPS, {
    variables: {limit, skip},
    onError: errorObj => {
      loggingService.error('Error fetching all groups:', errorObj);
    },
  });

  const loadMore = useCallback(async () => {
    if (!hasMore || loading) return;

    try {
      const result = await fetchMore({
        variables: {
          skip: data?.groups?.length || 0,
          limit,
        },
      });

      if (result.data.groups.length < limit) {
        setHasMore(false);
      }
    } catch (error) {
      loggingService.error('Error loading more groups:', error);
    }
  }, [data?.groups?.length, fetchMore, hasMore, limit, loading]);

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
};

export default GroupService;
