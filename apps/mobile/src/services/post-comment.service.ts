import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_POST_COMMENT,
  GET_POST_COMMENT,
  GET_POST_COMMENTS,
  REMOVE_POST_COMMENT,
  UPDATE_POST_COMMENT,
} from './graphql/post-comment.graphql';
import {
  IPostComment,
  ICreatePostComment,
  IUpdatePostComment,
} from '@motorove/shared/interfaces';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';
import {useTranslation} from '@/i18n';

// Hook for creating a post comment
export const useCreatePostComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createPostCommentMutation, {loading, error}] = useMutation(
    CREATE_POST_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.postComment.comment_created'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error creating post comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('screens.postComment.comment_created_failed'),
        });
      },
    },
  );

  const createPostComment = async (input: ICreatePostComment) => {
    try {
      const result = await createPostCommentMutation({
        variables: {input},
        update: (cache, {data: _data}) => {
          // Update post comment count on the post
          try {
            const postId = input.postId;
            const postData = cache.readQuery({
              query: GET_POST_COMMENT,
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
      return result.data?.createPostComment;
    } catch (err) {
      loggingService.error('Error in createPostComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createPostComment,
    loading,
    error,
  };
};

// Hook for updating a post comment
export const useUpdatePostComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updatePostCommentMutation, {loading, error}] = useMutation(
    UPDATE_POST_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.postComment.comment_updated'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error updating post comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('screens.postComment.comment_updated_failed'),
        });
      },
    },
  );

  const updatePostComment = async (input: IUpdatePostComment) => {
    try {
      const result = await updatePostCommentMutation({
        variables: {input},
      });
      return result.data?.updatePostComment;
    } catch (err) {
      loggingService.error('Error in updatePostComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updatePostComment,
    loading,
    error,
  };
};

// Hook for removing a post comment
export const useRemovePostComment = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removePostCommentMutation, {loading, error}] = useMutation(
    REMOVE_POST_COMMENT,
    {
      onCompleted: _data => {
        showToast({
          type: 'success',
          text1: t('common.success'),
          text2: t('screens.postComment.comment_deleted'),
        });

        if (onSuccess) {
          onSuccess();
        }
      },
      onError: errorObj => {
        loggingService.error('Error removing post comment:', errorObj);
        showToast({
          type: 'error',
          text1: t('common.error'),
          text2:
            errorObj.message || t('screens.postComment.comment_deleted_failed'),
        });
      },
    },
  );

  const removePostComment = async (id: string, postId: string) => {
    try {
      const result = await removePostCommentMutation({
        variables: {id},
        update: cache => {
          // Update comment count on the post
          try {
            const postData = cache.readQuery({
              query: GET_POST_COMMENT,
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
      return result.data?.removePostComment;
    } catch (err) {
      loggingService.error('Error in removePostComment:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removePostComment,
    loading,
    error,
  };
};

// Hook for getting a single post comment
export const useGetPostComment = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_POST_COMMENT, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching post comment:', errorObj);
    },
  });

  return {
    postComment: data?.postComment as IPostComment | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting post comments for a post
export const useGetPostComments = (postId: string) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
  } = useQuery(GET_POST_COMMENTS, {
    variables: {postId},
    skip: !postId,
    onError: errorObj => {
      loggingService.error(
        'Error fetching post comments for post:',
        {postId},
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
    postComments: data?.postComments as IPostComment[] | undefined,
    loading,
    error,
    refetch,
    hasMore,
  };
};
