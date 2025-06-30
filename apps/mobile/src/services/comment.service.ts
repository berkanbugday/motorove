import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_COMMENT,
  GET_COMMENT,
  GET_COMMENTS,
  REMOVE_COMMENT,
  UPDATE_COMMENT,
} from './graphql/comment.graphql';
import {
  IComment,
  ICreateComment,
  IUpdateComment,
} from '@motorove/shared/interfaces';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';

// Hook for creating a comment
export const useCreateComment = (onSuccess?: () => void) => {
  const [createCommentMutation, {loading, error}] = useMutation(
    CREATE_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: 'Success',
          text2: 'Comment created successfully!',
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating comment:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to create comment. Please try again.',
        });
      },
    },
  );

  const createComment = async (input: ICreateComment) => {
    try {
      const result = await createCommentMutation({
        variables: {input},
        update: (cache, {data: _data}) => {
          // Update comment count on the post
          try {
            const postId = input.postId;
            const postData = cache.readQuery({
              query: GET_COMMENT,
              variables: {id: postId},
            }) as {post?: any} | null;

            if (postData?.post) {
              cache.modify({
                id: cache.identify(postData.post),
                fields: {
                  commentsCount: (existing = 0) => existing + 1,
                },
              });
            }
          } catch (err) {
            loggingService.error('Error updating cache:', err);
          }
        },
      });
      return result.data?.createComment;
    } catch (err) {
      loggingService.error('Error in createComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createComment,
    loading,
    error,
  };
};

// Hook for updating a comment
export const useUpdateComment = (onSuccess?: () => void) => {
  const [updateCommentMutation, {loading, error}] = useMutation(
    UPDATE_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: 'Success',
          text2: 'Comment updated successfully!',
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating comment:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to update comment. Please try again.',
        });
      },
    },
  );

  const updateComment = async (input: IUpdateComment) => {
    try {
      const result = await updateCommentMutation({
        variables: {input},
      });
      return result.data?.updateComment;
    } catch (err) {
      loggingService.error('Error in updateComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updateComment,
    loading,
    error,
  };
};

// Hook for removing a comment
export const useRemoveComment = (onSuccess?: () => void) => {
  const [removeCommentMutation, {loading, error}] = useMutation(
    REMOVE_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: 'Success',
          text2: 'Comment removed successfully!',
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error removing comment:', errorObj);
        showToast({
          type: 'error',
          text1: 'Error',
          text2:
            errorObj.message || 'Failed to remove comment. Please try again.',
        });
      },
    },
  );

  const removeComment = async (id: string, postId: string) => {
    try {
      const result = await removeCommentMutation({
        variables: {id},
        update: cache => {
          // Update comment count on the post
          try {
            const postData = cache.readQuery({
              query: GET_COMMENT,
              variables: {id: postId},
            }) as {post?: any} | null;

            if (postData?.post) {
              cache.modify({
                id: cache.identify(postData.post),
                fields: {
                  commentsCount: (existing = 0) => Math.max(0, existing - 1),
                },
              });
            }
          } catch (err) {
            loggingService.error('Error updating cache:', err);
          }
        },
      });
      return result.data?.removeComment;
    } catch (err) {
      loggingService.error('Error in removeComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removeComment,
    loading,
    error,
  };
};

// Hook for getting a single comment
export const useGetComment = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_COMMENT, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching comment:', errorObj);
    },
  });

  return {
    comment: data?.comment as IComment | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting comments for a post
export const useGetComments = (postId: string) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
  } = useQuery(GET_COMMENTS, {
    variables: {postId},
    skip: !postId,
    onError: errorObj => {
      loggingService.error('Error fetching comments:', errorObj);
    },
  });

  // Wrap the original refetch to reset hasMore state
  const refetch = useCallback(async () => {
    setHasMore(true);
    return await originalRefetch();
  }, [originalRefetch]);

  return {
    comments: data?.comments as IComment[] | undefined,
    loading,
    error,
    refetch,
    hasMore,
  };
};
