import {
  Resolver,
  Query,
  Mutation,
  Args,
  ID,
  Int,
  Float,
  Context,
} from '@nestjs/graphql';
import { BusinessCommentsService } from './business-comments.service';
import { CreateBusinessCommentInput } from './dto/create-business-comment.input';
import { UpdateBusinessCommentInput } from './dto/update-business-comment.input';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BusinessCommentDto } from './dto/business-comment.dto';
import { Request } from 'express';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => BusinessCommentDto)
export class BusinessCommentsResolver {
  constructor(
    private readonly businessCommentsService: BusinessCommentsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [BusinessCommentDto], { name: 'businessComments' })
  async findAll(
    @Context() context: GqlContext,
    @Args('businessId', { type: () => ID }) businessId: string,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<BusinessCommentDto[]> {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.businessCommentsService.findAll(
      businessId,
      limit,
      skip,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => BusinessCommentDto, { name: 'businessComment' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<BusinessCommentDto> {
    return await this.businessCommentsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Query(() => Float, { name: 'businessAverageRating' })
  async getAverageRating(
    @Args('businessId', { type: () => ID }) businessId: string,
  ): Promise<number> {
    return await this.businessCommentsService.getAverageRating(businessId);
  }

  @UseGuards(JwtGuard)
  @Query(() => Int, { name: 'businessCommentCount' })
  async getCommentCount(
    @Args('businessId', { type: () => ID }) businessId: string,
  ): Promise<number> {
    return await this.businessCommentsService.getCommentCount(businessId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => BusinessCommentDto)
  async createBusinessComment(
    @CurrentUser() user: User,
    @Args('input') input: CreateBusinessCommentInput,
  ): Promise<BusinessCommentDto> {
    return await this.businessCommentsService.create(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => BusinessCommentDto)
  async updateBusinessComment(
    @CurrentUser() user: User,
    @Args('input') input: UpdateBusinessCommentInput,
  ): Promise<BusinessCommentDto> {
    return await this.businessCommentsService.update(input, user.id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeBusinessComment(
    @CurrentUser() user: User,
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return await this.businessCommentsService.remove(id, user.id);
  }
}
