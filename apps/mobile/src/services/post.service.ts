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
import {
  Post,
  CreatePostInput,
  UpdatePostInput,
} from '../types/models/post.model';
import {loggingService} from './logging.service';
import {showToast} from '@components';
import {useState, useCallback} from 'react';

// Hook for creating a post
export const useCreatePost = (onSuccess?: () => void) => {
  const [createPostMutation, {loading, error}] = useMutation(CREATE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Post created successfully!',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error creating post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to create post. Please try again.',
      });
    },
  });

  const createPost = async (input: CreatePostInput) => {
    try {
      const result = await createPostMutation({
        variables: {input: {...input, images: input.images ?? []}},
      });
      return result.data?.createPost;
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
  const [updatePostMutation, {loading, error}] = useMutation(UPDATE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Post updated successfully!',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error updating post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to update post. Please try again.',
      });
    },
  });

  const updatePost = async (updatePostInput: UpdatePostInput) => {
    try {
      const result = await updatePostMutation({
        variables: {updatePostInput},
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
  const [removePostMutation, {loading, error}] = useMutation(REMOVE_POST, {
    onCompleted: _data => {
      showToast({
        type: 'success',
        text1: 'Success',
        text2: 'Post removed successfully!',
      });

      if (onSuccess) {
        onSuccess();
      }
    },
    onError: errorObj => {
      loggingService.error('Error removing post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to remove post. Please try again.',
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
    post: data?.post as Post | undefined,
    loading,
    error,
    refetch,
  };
};

// Hook for getting posts
export const useGetPosts = (
  groupId?: string,
  createdById?: string,
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

          return {
            posts: [...prev.posts, ...fetchMoreResult.posts],
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
    posts: (data?.posts as Post[]) || [],
    loading,
    error,
    refetch,
    loadMore,
    hasMore,
  };
};

// Hook for liking a post
export const useLikePost = () => {
  const [likePostMutation, {loading, error}] = useMutation(LIKE_POST, {
    onError: errorObj => {
      loggingService.error('Error liking post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to like post. Please try again.',
      });
    },
  });

  const likePost = async (postId: string) => {
    try {
      const result = await likePostMutation({
        variables: {postId},
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
  const [unlikePostMutation, {loading, error}] = useMutation(UNLIKE_POST, {
    onError: errorObj => {
      loggingService.error('Error unliking post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to unlike post. Please try again.',
      });
    },
  });

  const unlikePost = async (postId: string) => {
    try {
      const result = await unlikePostMutation({
        variables: {postId},
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
  const [savePostMutation, {loading, error}] = useMutation(SAVE_POST, {
    onError: errorObj => {
      loggingService.error('Error saving post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to save post. Please try again.',
      });
    },
  });

  const savePost = async (postId: string) => {
    try {
      const result = await savePostMutation({
        variables: {postId},
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
  const [unsavePostMutation, {loading, error}] = useMutation(UNSAVE_POST, {
    onError: errorObj => {
      loggingService.error('Error unsaving post:', errorObj);
      showToast({
        type: 'error',
        text1: 'Error',
        text2: errorObj.message || 'Failed to unsave post. Please try again.',
      });
    },
  });

  const unsavePost = async (postId: string) => {
    try {
      const result = await unsavePostMutation({
        variables: {postId},
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
