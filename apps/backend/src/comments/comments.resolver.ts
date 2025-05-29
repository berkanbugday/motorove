import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { CommentsService } from './comments.service';
import { Comment } from './models/comment.model';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../auth/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';

@Resolver(() => Comment)
export class CommentsResolver {
  constructor(private readonly commentsService: CommentsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [Comment], { name: 'comments' })
  findAll(@Args('postId', { type: () => ID }) postId: string) {
    return this.commentsService.findAll(postId);
  }

  @UseGuards(JwtGuard)
  @Query(() => Comment, { name: 'comment' })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.commentsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  createComment(
    @CurrentUser() user: User,
    @Args('createCommentInput') createCommentInput: CreateCommentInput,
  ) {
    const userId = user.id;
    return this.commentsService.create(userId, createCommentInput);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  updateComment(
    @CurrentUser() user: User,
    @Args('updateCommentInput') updateCommentInput: UpdateCommentInput,
  ) {
    return this.commentsService.update(user.id, updateCommentInput);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Comment)
  removeComment(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ) {
    return this.commentsService.remove(user.id, id);
  }
}
