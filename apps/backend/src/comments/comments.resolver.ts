import { Resolver, Query, Mutation, Args, ID, Int } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CommentFilterInput } from './dto/comment-filter.input';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [Comment], { name: 'comments' })
  async findAll(
    @Args('postId', { type: () => ID }) postId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => CommentFilterInput, nullable: true })
    filters?: CommentFilterInput,
  ) {
    return this.commentsService.findAll(postId, limit, skip, filters);
  }

  @UseGuards(JwtGuard)
  @Query(() => Comment, { name: 'comment' })
  async findOne(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  async create(
    @CurrentUser() user: User,
    @Args('input') input: CreateCommentInput,
  ) {
    return this.commentsService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  async update(
    @CurrentUser() user: User,
    @Args('input') input: UpdateCommentInput,
  ) {
    return this.commentsService.update(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  async remove(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.commentsService.remove(id, user.id);
  }
}
