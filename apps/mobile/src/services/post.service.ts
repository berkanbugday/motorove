import {ApolloError} from '@apollo/client';
import {apolloClient} from '../configs/apolloClientConfig';
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
  PostLike,
  PostSave,
} from '../types/models/post.model';
import {loggingService} from './logging.service';
import {graphQLErrorService} from './graphql-error.service';

class PostService {
  /**
   * Get all posts for a specific group
   * @param groupId Group ID
   * @param createdById Optional user ID to filter posts by creator
   * @returns List of posts
   */
  async getPosts(groupId: string, createdById?: string): Promise<Post[]> {
    try {
      const {data} = await apolloClient.query({
        query: GET_POSTS,
        variables: {groupId, createdById},
        fetchPolicy: 'network-only',
      });
      return data.posts;
    } catch (error) {
      loggingService.error('Error getting posts:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Get a single post by ID
   * @param id Post ID
   * @returns Post details
   */
  async getPost(id: string): Promise<Post> {
    try {
      const {data} = await apolloClient.query({
        query: GET_POST,
        variables: {id},
        fetchPolicy: 'network-only',
      });
      return data.post;
    } catch (error) {
      loggingService.error('Error getting post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Create a new post
   * @param createPostInput Post data
   * @returns Created post
   */
  async createPost(createPostInput: CreatePostInput): Promise<Post> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: CREATE_POST,
        variables: {createPostInput},
      });
      return data.createPost;
    } catch (error) {
      loggingService.error('Error creating post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Update an existing post
   * @param updatePostInput Updated post data
   * @returns Updated post
   */
  async updatePost(updatePostInput: UpdatePostInput): Promise<Post> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: UPDATE_POST,
        variables: {updatePostInput},
      });
      return data.updatePost;
    } catch (error) {
      loggingService.error('Error updating post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Delete a post
   * @param id Post ID
   * @returns Deleted post
   */
  async removePost(id: string): Promise<Post> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: REMOVE_POST,
        variables: {id},
      });
      return data.removePost;
    } catch (error) {
      loggingService.error('Error removing post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Like a post
   * @param postId Post ID
   * @returns Like details
   */
  async likePost(postId: string): Promise<PostLike> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: LIKE_POST,
        variables: {postId},
      });
      return data.likePost;
    } catch (error) {
      loggingService.error('Error liking post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Unlike a post
   * @param postId Post ID
   * @returns ID of the unliked post
   */
  async unlikePost(postId: string): Promise<string> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: UNLIKE_POST,
        variables: {postId},
      });
      return data.unlikePost;
    } catch (error) {
      loggingService.error('Error unliking post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Save a post
   * @param postId Post ID
   * @returns Save details
   */
  async savePost(postId: string): Promise<PostSave> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: SAVE_POST,
        variables: {postId},
      });
      return data.savePost;
    } catch (error) {
      loggingService.error('Error saving post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }

  /**
   * Unsave a post
   * @param postId Post ID
   * @returns ID of the unsaved post
   */
  async unsavePost(postId: string): Promise<string> {
    try {
      const {data} = await apolloClient.mutate({
        mutation: UNSAVE_POST,
        variables: {postId},
      });
      return data.unsavePost;
    } catch (error) {
      loggingService.error('Error unsaving post:', error);
      throw graphQLErrorService.handleGraphQLError(error as ApolloError);
    }
  }
}

export const postService = new PostService();
