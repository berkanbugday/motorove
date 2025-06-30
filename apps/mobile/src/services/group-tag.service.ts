import {useQuery} from '@apollo/client';
import {GET_GROUP_TAGS, GET_GROUP_TAG} from './graphql/group-tag.graphql';
import {loggingService} from './logging.service';
import {IGroupTag} from '@motorove/shared/interfaces';

// Hook for getting all group tags
export const useGetGroupTags = () => {
  const {data, loading, error, refetch} = useQuery(GET_GROUP_TAGS, {
    onError: errorObj => {
      loggingService.error('Error fetching group tags:', errorObj);
    },
  });

  return {
    groupTags: (data?.groupTags as IGroupTag[]) || [],
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
    onError: errorObj => {
      loggingService.error('Error fetching group tag:', errorObj);
    },
  });

  return {
    groupTag: data?.groupTag as IGroupTag | undefined,
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
