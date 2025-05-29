import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  ResolveField,
  Parent,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { Post } from './models/post.model';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Comment } from '../comments/models/comment.model';
import { CommentsService } from '../comments/comments.service';
import { PostLike } from './models/post-like.model';
import { PostSave } from './models/post-save.model';

@Resolver(() => Post)
export class PostsResolver {
  constructor(
    private readonly postsService: PostsService,
    private readonly commentsService: CommentsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [Post], { name: 'posts' })
  findAll(
    @Args('groupId', { type: () => ID }) groupId: string,
    @CurrentUser() user: User,
    @Args('authorId', { type: () => ID, nullable: true }) authorId?: string,
  ) {
    return this.postsService.findAll(groupId, authorId, user.id);
  }

  @UseGuards(JwtGuard)
  @Query(() => Post, { name: 'post' })
  findOne(
    @Args('id', { type: () => ID }) id: string,
    @CurrentUser() user: User,
  ) {
    return this.postsService.findOne(id, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  createPost(
    @CurrentUser() user: User,
    @Args('createPostInput') createPostInput: CreatePostInput,
  ) {
    return this.postsService.create(user.id, createPostInput);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  updatePost(
    @CurrentUser() user: User,
    @Args('updatePostInput') updatePostInput: UpdatePostInput,
  ) {
    return this.postsService.update(user.id, updatePostInput);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Post)
  removePost(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.postsService.remove(user.id, id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostLike)
  likePost(
    @CurrentUser() user: User,
    @Args('postId', { type: () => ID }) postId: string,
  ) {
    return this.postsService.likePost(user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ID)
  unlikePost(
    @CurrentUser() user: User,
    @Args('postId', { type: () => ID }) postId: string,
  ) {
    return this.postsService.unlikePost(user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostSave)
  savePost(
    @CurrentUser() user: User,
    @Args('postId', { type: () => ID }) postId: string,
  ) {
    return this.postsService.savePost(user.id, postId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => ID)
  unsavePost(
    @CurrentUser() user: User,
    @Args('postId', { type: () => ID }) postId: string,
  ) {
    return this.postsService.unsavePost(user.id, postId);
  }

  @ResolveField('comments', () => [Comment])
  async getComments(@Parent() post: Post) {
    return this.commentsService.findAll(post.id);
  }
}
