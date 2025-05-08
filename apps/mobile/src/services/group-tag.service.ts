import {useQuery} from '@apollo/client';
import {GET_GROUP_TAGS, GET_GROUP_TAG} from './graphql/group-tag.graphql';
import {loggingService} from './logging.service';

// Type definitions
export interface GroupTag {
  id: string;
  value: string;
}

// Hook for getting all group tags
export const useGetGroupTags = () => {
  const {data, loading, error, refetch} = useQuery(GET_GROUP_TAGS, {
    onError: error => {
      loggingService.error('Error fetching group tags:', error);
    },
  });

  return {
    groupTags: (data?.groupTags as GroupTag[]) || [],
    loading,
    error,
    refetch,
  };
};

// Hook for getting a specific group tag
export const useGetGroupTag = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_GROUP_TAG, {
    variables: {id},
    skip: !id,
    onError: error => {
      loggingService.error('Error fetching group tag:', error);
    },
  });

  return {
    groupTag: data?.groupTag as GroupTag | undefined,
    loading,
    error,
    refetch,
  };
};

// Export as GroupTagService object
export const GroupTagService = {
  useGetGroupTags,
  useGetGroupTag,
};

export default GroupTagService;
