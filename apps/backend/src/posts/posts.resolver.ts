import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
  Context,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Comment } from '../comments/models/comment.model';
import { CommentsService } from '../comments/comments.service';
import { PostLike } from './models/post-like.model';
import { PostSave } from './models/post-save.model';
import { Request } from 'express';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [Post], { name: 'posts' })
  findAll(
    @Context() context: GqlContext,
    @Args('groupId', { type: () => ID, nullable: true }) groupId?: string,
    @Args('createdById', { type: () => ID, nullable: true })
    createdById?: string,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.postsService.findAll(groupId, createdById, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => Post, { name: 'post' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.postsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  createPost(
    @Args('createPostInput') createPostInput: CreatePostInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.postsService.create(userId, createPostInput, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  updatePost(
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.postsService.update(userId, updatePostInput, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  removePost(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.postsService.remove(userId, id, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostLike)
  likePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.postsService.likePost(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ID)
  unlikePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.postsService.unlikePost(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostSave)
  savePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.postsService.savePost(userId, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ID)
  unsavePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.postsService.unsavePost(userId, postId);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() post: Post) {
    return this.commentsService.findAll(post.id);
  }
}
