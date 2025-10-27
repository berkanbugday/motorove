import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { PostCommentsService } from './post-comments.service';
import { CreatePostCommentInput } from './dto/create-post-comment.input';
import { UpdatePostCommentInput } from './dto/update-post-comment.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { PostCommentDto } from './dto/post-comment.dto';

@Resolver(() => PostCommentDto)
export class PostCommentsResolver {
  constructor(private readonly postCommentsService: PostCommentsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [PostCommentDto], { name: 'postComments' })
  async findAll(
    @Args('postId', { type: () => ID }) postId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ) {
    return await this.postCommentsService.findAll(postId, limit, skip);
  }

  @UseGuards(JwtGuard)
  @Query(() => PostCommentDto, { name: 'postComment' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return await this.postCommentsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostCommentDto)
  async createPostComment(
    @CurrentUser() user: User,
    @Args('input') input: CreatePostCommentInput,
  ) {
    return await this.postCommentsService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostCommentDto)
  async updatePostComment(
    @CurrentUser() user: User,
    @Args('input') input: UpdatePostCommentInput,
  ) {
    return await this.postCommentsService.update(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => PostCommentDto)
  async removePostComment(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return await this.postCommentsService.remove(id, user.id);
  }
}
