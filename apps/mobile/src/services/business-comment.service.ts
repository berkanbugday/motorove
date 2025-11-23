import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_BUSINESS_COMMENT,
  GET_BUSINESS_COMMENT,
  GET_BUSINESS_COMMENTS,
  GET_BUSINESS_AVERAGE_RATING,
  GET_BUSINESS_COMMENT_COUNT,
  REMOVE_BUSINESS_COMMENT,
  UPDATE_BUSINESS_COMMENT,
} from './graphql/business-comment.graphql';
import {
  IBusinessComment,
  ICreateBusinessComment,
  IUpdateBusinessComment,
} from '@motorove/shared/interfaces';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';
import useTranslation from '@hooks/useTranslation';

// Hook for creating a business comment
export const useCreateBusinessComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createBusinessCommentMutation, {loading, error}] = useMutation(
    CREATE_BUSINESS_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.map.comment_created'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating business comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.map.error_creating_comment'),
        });
      },
    },
  );

  const createBusinessComment = async (input: ICreateBusinessComment) => {
    try {
      const result = await createBusinessCommentMutation({
        variables: {input},
        refetchQueries: [
          {
            query: GET_BUSINESS_COMMENTS,
            variables: {businessId: input.businessId},
          },
          {
            query: GET_BUSINESS_AVERAGE_RATING,
            variables: {businessId: input.businessId},
          },
          {
            query: GET_BUSINESS_COMMENT_COUNT,
            variables: {businessId: input.businessId},
          },
        ],
      });
      return result.data?.createBusinessComment;
    } catch (err) {
      loggingService.error('Error in createBusinessComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createBusinessComment,
    loading,
    error,
  };
};

// Hook for updating a business comment
export const useUpdateBusinessComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updateBusinessCommentMutation, {loading, error}] = useMutation(
    UPDATE_BUSINESS_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.map.comment_updated'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating business comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.map.error_updating_comment'),
        });
      },
    },
  );

  const updateBusinessComment = async (input: IUpdateBusinessComment) => {
    try {
      const result = await updateBusinessCommentMutation({
        variables: {input},
      });
      return result.data?.updateBusinessComment;
    } catch (err) {
      loggingService.error('Error in updateBusinessComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateBusinessComment,
    loading,
    error,
  };
};

// Hook for removing a business comment
export const useRemoveBusinessComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removeBusinessCommentMutation, {loading, error}] = useMutation(
    REMOVE_BUSINESS_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.map.comment_removed'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error removing business comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2: errorObj.message || t('screens.map.error_removing_comment'),
        });
      },
    },
  );

  const removeBusinessComment = async (id: string, businessId: string) => {
    try {
      const result = await removeBusinessCommentMutation({
        variables: {id},
        refetchQueries: [
          {
            query: GET_BUSINESS_COMMENTS,
            variables: {businessId},
          },
          {
            query: GET_BUSINESS_AVERAGE_RATING,
            variables: {businessId},
          },
          {
            query: GET_BUSINESS_COMMENT_COUNT,
            variables: {businessId},
          },
        ],
      });
      return result.data?.removeBusinessComment as boolean;
    } catch (err) {
      loggingService.error('Error in removeBusinessComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removeBusinessComment,
    loading,
    error,
  };
};

// Hook for getting a single business comment
export const useGetBusinessComment = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_BUSINESS_COMMENT, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching business comment:', errorObj);
    },
  });

  return {
    businessComment: data?.businessComment as IBusinessComment | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting business comments for a business
export const useGetBusinessComments = (businessId: string, limit?: number) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
  } = useQuery(GET_BUSINESS_COMMENTS, {
    variables: {businessId, limit},
    skip: !businessId,
    onError: errorObj => {
      loggingService.error(
        'Error fetching business comments for business:',
        {businessId},
        errorObj,
      );
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  return {
    businessComments: data?.businessComments as IBusinessComment[] | undefined,
    loading,
    error,
    refetch,
    hasMore,
  };
};

// Hook for getting business average rating
export const useGetBusinessAverageRating = (businessId: string) => {
  const {data, loading, error, refetch} = useQuery(
    GET_BUSINESS_AVERAGE_RATING,
    {
      variables: {businessId},
      skip: !businessId,
      onError: errorObj => {
        loggingService.error(
          'Error fetching business average rating:',
          errorObj,
        );
      },
    },
  );

  return {
    averageRating: data?.businessAverageRating as number | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting business comment count
export const useGetBusinessCommentCount = (businessId: string) => {
  const {data, loading, error, refetch} = useQuery(GET_BUSINESS_COMMENT_COUNT, {
    variables: {businessId},
    skip: !businessId,
    onError: errorObj => {
      loggingService.error('Error fetching business comment count:', errorObj);
    },
  });

  return {
    commentCount: data?.businessCommentCount as number | undefined,
    loading,
    error,
    refetch,
  };
};
