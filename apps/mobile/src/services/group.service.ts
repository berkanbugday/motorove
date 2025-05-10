import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_GROUP,
  GET_GROUP,
  GET_GROUPS,
  GET_JOINED_GROUPS,
} from './graphql/group.graphql';
import {loggingService} from './logging.service';
import {showToast} from '@components';

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

export interface Group {
  id: string;
  name: string;
  description: string;
  logo: string | null;
  cover: string | null;
  city: {id: string; value: string};
  privacy: string;
  memberships: {id: string}[];
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
export const useGetJoinedGroups = () => {
  const {data, loading, error, refetch} = useQuery(GET_JOINED_GROUPS, {
    onError: errorObj => {
      loggingService.error('Error fetching user groups:', errorObj);
    },
  });

  return {
    groups: (data?.joinedGroups as Group[]) || [],
    loading,
    error,
    refetch,
  };
};

// Hook for getting all groups
export const useGetGroups = () => {
  const {data, loading, error, refetch} = useQuery(GET_GROUPS, {
    onError: errorObj => {
      loggingService.error('Error fetching all groups:', errorObj);
    },
  });

  return {
    groups: (data?.groups as Group[]) || [],
    loading,
    error,
    refetch,
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
