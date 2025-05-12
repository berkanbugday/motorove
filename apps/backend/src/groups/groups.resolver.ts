import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './models/group.model';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

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
  findAll(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.groupsService.findAll(userId, authToken);
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
  findJoinedGroups(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.groupsService.findJoinedGroups(userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'createdGroups' })
  findCreatedByMe(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    return this.groupsService.findCreatedByUser(userId);
  }
}
