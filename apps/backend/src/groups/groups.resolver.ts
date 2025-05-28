import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './models/group.model';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { Int } from '@nestjs/graphql';
import { GroupFilterInput } from './dto/group-filter.input';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => Group)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Group)
  createGroup(
    @Args('createGroupInput') createGroupInput: CreateGroupInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.groupsService.createGroup(userId, createGroupInput, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Group)
  updateGroup(
    @Args('updateGroupInput') updateGroupInput: UpdateGroupInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.groupsService.updateGroup(userId, updateGroupInput, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'groups' })
  findAll(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('filters', { type: () => GroupFilterInput, nullable: true })
    filters?: GroupFilterInput,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.groupsService.findAll(
      userId,
      authToken,
      limit,
      skip,
      query,
      filters,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => Group, { name: 'group' })
  findOne(@Args('id') id: string, @Context() context: GqlContext) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.groupsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'joinedGroups' })
  findJoinedGroups(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => GroupFilterInput, nullable: true })
    filters?: GroupFilterInput,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    console.log('filters', filters);
    return this.groupsService.findJoinedGroups(
      userId,
      authToken,
      limit,
      skip,
      filters,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'createdGroups' })
  findCreatedByMe(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    return this.groupsService.findCreatedByUser(userId);
  }
}
