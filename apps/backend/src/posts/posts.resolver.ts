import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Context,
  Int,
} from '@nestjs/graphql';
import { PostsService } from './posts.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { PostDto } from './dto/post.dto';
import { PostInteractionDto } from './dto/post-interaction.dto';
import { UserDto } from '../users/dto/user.dto';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => PostDto)
export class PostsResolver {
  constructor(private readonly postsService: PostsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [PostDto], { name: 'posts' })
  async findAll(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('groupId', { type: () => ID, nullable: true }) groupId?: string,
    @Args('createdById', { type: () => ID, nullable: true })
    createdById?: string,
  ): Promise<PostDto[]> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.findAll(
      groupId,
      createdById,
      limit,
      skip,
      userId,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => PostDto, { name: 'post' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<PostDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostDto)
  async createPost(
    @Args('input') input: CreatePostInput,
    @Context() context: GqlContext,
  ): Promise<PostDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.createPost(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostDto)
  async updatePost(
    @Args('input') input: UpdatePostInput,
    @Context() context: GqlContext,
  ): Promise<PostDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.updatePost(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostDto)
  async removePost(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<PostDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.removePost(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostInteractionDto)
  async likePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ): Promise<PostInteractionDto> {
    const userId = context.req.user.id;
    return await this.postsService.likePost(postId, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostInteractionDto)
  async unlikePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ): Promise<PostInteractionDto> {
    const userId = context.req.user.id;
    return await this.postsService.unlikePost(postId, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostInteractionDto)
  async savePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ): Promise<PostInteractionDto> {
    const userId = context.req.user.id;
    return await this.postsService.savePost(postId, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostInteractionDto)
  async unsavePost(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ): Promise<PostInteractionDto> {
    const userId = context.req.user.id;
    return await this.postsService.unsavePost(postId, userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [UserDto], { name: 'postLikedUsers' })
  async findPostLikedUsers(
    @Args('postId', { type: () => ID }) postId: string,
    @Context() context: GqlContext,
  ): Promise<UserDto[]> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.postsService.findPostLikedUsers(
      postId,
      userId,
      authToken,
    );
  }
}
