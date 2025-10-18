import {useMutation, useQuery} from '@apollo/client';
import {
  CREATE_POST,
  GET_POST,
  GET_POSTS,
  LIKE_POST,
  REMOVE_POST,
  SAVE_POST,
  UNLIKE_POST,
  UNSAVE_POST,
  UPDATE_POST,
} from './graphql/post.graphql';
import {IPost, ICreatePost, IUpdatePost} from '@motorove/shared';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';
import useTranslation from '@hooks/useTranslation';
import {useAuth} from '@contexts/AuthContext';

// Hook for creating a post
export const useCreatePost = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [createPostMutation, {loading, error}] = useMutation(CREATE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.post.post_created'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error creating post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.post_created_failed'),
      });
    },
  });

  const createPost = async (input: ICreatePost) => {
    try {
      const result = await createPostMutation({
        variables: {input},
      });
      return result.data?.create;
    } catch (err) {
      loggingService.error('Error in createPost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    createPost,
    loading,
    error,
  };
};

// Hook for updating a post
export const useUpdatePost = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [updatePostMutation, {loading, error}] = useMutation(UPDATE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.post.post_updated'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error updating post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.post_updated_failed'),
      });
    },
  });

  const updatePost = async (input: IUpdatePost) => {
    try {
      const result = await updatePostMutation({
        variables: {input: {...input, images: input.images ?? []}},
      });
      return result.data?.updatePost;
    } catch (err) {
      loggingService.error('Error in updatePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    updatePost,
    loading,
    error,
  };
};

// Hook for removing a post
export const useRemovePost = (onSuccess?: () => void) => {
  const {t} = useTranslation();
  const [removePostMutation, {loading, error}] = useMutation(REMOVE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: t('common.success'),
        text2: t('screens.post.post_deleted'),
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error removing post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.post_deleted_failed'),
      });
    },
  });

  const removePost = async (id: string) => {
    try {
      const result = await removePostMutation({
        variables: {id},
      });
      return result.data?.removePost;
    } catch (err) {
      loggingService.error('Error in removePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    removePost,
    loading,
    error,
  };
};

// Hook for getting a single post
export const useGetPost = (id: string) => {
  const {data, loading, error, refetch} = useQuery(GET_POST, {
    variables: {id},
    skip: !id,
    onError: errorObj => {
      loggingService.error('Error fetching post:', errorObj);
    },
  });

  return {
    post: data?.post as IPost | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting posts
export const useGetPosts = (
  groupId?: string,
  createdById?: string,
  savedById?: string,
  limit = 20,
  skip = 0,
) => {
  const [hasMore, setHasMore] = useState(true);

  const {
    data,
    loading,
    error,
    refetch: originalRefetch,
    fetchMore,
  } = useQuery(GET_POSTS, {
    variables: {
      ...(groupId && {groupId}),
      ...(createdById && {createdById}),
      ...(savedById && {savedById}),
      limit,
      skip,
    },
    onError: errorObj => {
      loggingService.error('Error fetching posts:', errorObj);
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
          ...(groupId && {groupId}),
          ...(createdById && {createdById}),
          skip: data?.posts?.length || 0,
          limit,
        },
        updateQuery: (prev, {fetchMoreResult}) => {
          if (!fetchMoreResult) {
            return prev;
          }

          // Create a Set of existing post IDs to prevent duplicates
          const existingIds = new Set(prev.posts.map((post: any) => post.id));

          // Filter out any posts that already exist
          const newPosts = fetchMoreResult.posts.filter(
            (post: any) => !existingIds.has(post.id),
          );

          return {
            posts: [...prev.posts, ...newPosts],
          };
        },
      });

      if (result.data.posts.length < limit) {
        setHasMore(false);
      }
    } catch (errorObj) {
      loggingService.error('Error loading more posts:', errorObj);
    }
  }, [
    data?.posts?.length,
    fetchMore,
    hasMore,
    limit,
    loading,
    groupId,
    createdById,
  ]);

  return {
    posts: (data?.posts as IPost[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for liking a post
export const useLikePost = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [likePostMutation, {loading, error}] = useMutation(LIKE_POST, {
    onError: errorObj => {
      loggingService.error('Error liking post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.like_failed'),
      });
    },
  });

  const likePost = async (postId: string) => {
    try {
      // Make sure we have the current user
      if (!user) {
        loggingService.error('Cannot like post: User not authenticated');
        return null;
      }

      const result = await likePostMutation({
        variables: {postId},
        optimisticResponse: {
          likePost: {
            __typename: 'PostDto',
            id: postId,
            postId: postId,
            isLiked: true,
            likesCount: +1,
          },
        },
        update: cache => {
          // Find all normalized Post objects that match this id
          const cacheId = cache.identify({__typename: 'PostDto', id: postId});

          if (cacheId) {
            // Update the cache directly with the optimistic values
            cache.modify({
              id: cacheId,
              fields: {
                isLiked: () => true,
                likesCount: (existingCount = 0) =>
                  (existingCount as number) + 1,
                likedUsers: (existingUsers = []) => {
                  // Cast to array type since Apollo cache returns unknown
                  const usersArray = existingUsers as Array<{__ref: string}>;

                  // Check if user is already in the likedUsers array
                  const userExists = usersArray.some(
                    likedUser => likedUser.__ref === `UserDto:${user.id}`,
                  );

                  // If user is already in the array, return the existing array
                  if (userExists) {
                    return usersArray;
                  }

                  // Add the current user to the likedUsers array
                  return [...usersArray, {__ref: `UserDto:${user.id}`}];
                },
              },
            });
          }
        },
      });
      return result.data?.likePost;
    } catch (err) {
      loggingService.error('Error in likePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    likePost,
    loading,
    error,
  };
};

// Hook for unliking a post
export const useUnlikePost = () => {
  const {t} = useTranslation();
  const {user} = useAuth();
  const [unlikePostMutation, {loading, error}] = useMutation(UNLIKE_POST, {
    onError: errorObj => {
      loggingService.error('Error unliking post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.unlike_failed'),
      });
    },
  });

  const unlikePost = async (postId: string) => {
    try {
      // Make sure we have the current user
      if (!user) {
        loggingService.error('Cannot unlike post: User not authenticated');
        return null;
      }

      const result = await unlikePostMutation({
        variables: {postId},
        optimisticResponse: {
          unlikePost: {
            __typename: 'PostDto',
            id: postId,
            postId: postId,
            isLiked: false,
            likesCount: -1,
          },
        },
        update: cache => {
          // Find all normalized Post objects that match this id
          const cacheId = cache.identify({__typename: 'PostDto', id: postId});

          if (cacheId) {
            // Update the cache directly with the optimistic values
            cache.modify({
              id: cacheId,
              fields: {
                isLiked: () => false,
                likesCount: (existingCount = 0) => {
                  const currentCount = existingCount as number;
                  return Math.max(0, currentCount - 1); // Avoid negative counts
                },
                likedUsers: (existingUsers = []) => {
                  // Cast to array type since Apollo cache returns unknown
                  const usersArray = existingUsers as Array<{__ref: string}>;

                  // Remove the current user from the likedUsers array
                  return usersArray.filter(
                    likedUser => likedUser.__ref !== `UserDto:${user.id}`,
                  );
                },
              },
            });
          }
        },
      });
      return result.data?.unlikePost;
    } catch (err) {
      loggingService.error('Error in unlikePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    unlikePost,
    loading,
    error,
  };
};

// Hook for saving a post
export const useSavePost = () => {
  const {t} = useTranslation();
  const [savePostMutation, {loading, error}] = useMutation(SAVE_POST, {
    onError: errorObj => {
      loggingService.error('Error saving post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.save_failed'),
      });
    },
  });

  const savePost = async (postId: string) => {
    try {
      const result = await savePostMutation({
        variables: {postId},
        optimisticResponse: {
          savePost: {
            __typename: 'PostDto',
            id: postId,
            postId: postId,
            isSaved: true,
          },
        },
        update: cache => {
          // Find all normalized Post objects that match this id
          const cacheId = cache.identify({__typename: 'PostDto', id: postId});

          if (cacheId) {
            // Update the cache directly with the optimistic values
            cache.modify({
              id: cacheId,
              fields: {
                isSaved: () => true,
              },
            });
          }
        },
      });
      return result.data?.savePost;
    } catch (err) {
      loggingService.error('Error in savePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    savePost,
    loading,
    error,
  };
};

// Hook for unsaving a post
export const useUnsavePost = () => {
  const {t} = useTranslation();
  const [unsavePostMutation, {loading, error}] = useMutation(UNSAVE_POST, {
    onError: errorObj => {
      loggingService.error('Error unsaving post:', errorObj);
      showToast({
        type: 'error',
        text1: t('common.error'),
        text2: errorObj.message || t('screens.post.unsave_failed'),
      });
    },
  });

  const unsavePost = async (postId: string) => {
    try {
      const result = await unsavePostMutation({
        variables: {postId},
        optimisticResponse: {
          unsavePost: {
            __typename: 'PostDto',
            id: postId,
            postId: postId,
            isSaved: false,
          },
        },
        update: cache => {
          // Find all normalized Post objects that match this id
          const cacheId = cache.identify({__typename: 'PostDto', id: postId});

          if (cacheId) {
            // Update the cache directly with the optimistic values
            cache.modify({
              id: cacheId,
              fields: {
                isSaved: () => false,
              },
            });
          }
        },
      });
      return result.data?.unsavePost;
    } catch (err) {
      loggingService.error('Error in unsavePost:', err);
      // Error is already handled in onError callback
      return null;
    }
  };

  return {
    unsavePost,
    loading,
    error,
  };
};

// Export as PostService object
export const PostService = {
  useCreatePost,
  useUpdatePost,
  useRemovePost,
  useGetPost,
  useGetPosts,
  useLikePost,
  useUnlikePost,
  useSavePost,
  useUnsavePost,
};

export default PostService;
