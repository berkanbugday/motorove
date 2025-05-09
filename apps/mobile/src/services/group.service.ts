import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_GROUP,
  GET_GROUP,
  GET_USER_GROUPS,
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
  city: string;
  privacy: string;
  membersCapacity: number | null;
  tags: string[];
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
    onError: error => {
      loggingService.error('Error creating group:', error);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: error.message || 'Failed to create group. Please try again.',
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
    } catch (error) {
      loggingService.error('Error in createGroup:', error);
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
    onError: error => {
      loggingService.error('Error fetching group:', error);
    },
  });

  return {
    group: data?.getGroup as Group | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting user's groups
export const useGetUserGroups = () => {
  const {data, loading, error, refetch} = useQuery(GET_USER_GROUPS, {
    onError: error => {
      loggingService.error('Error fetching user groups:', error);
    },
  });

  return {
    groups: (data?.myGroups as Group[]) || [],
    loading,
    error,
    refetch,
  };
};

// Export as GroupService object
export const GroupService = {
  useCreateGroup,
  useGetGroup,
  useGetUserGroups,
};

export default GroupService;
