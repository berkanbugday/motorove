import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { Group } from './models/group.model';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';

interface GqlContext {
  req: Request & { user: { id: string } };
}

@Resolver(() => Group)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Group)
  createGroup(
    @Args('input') createGroupInput: CreateGroupInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.groupsService.createGroup(userId, createGroupInput);
  }

  @Query(() => [Group], { name: 'groups' })
  findAll() {
    return this.groupsService.findAll();
  }

  @Query(() => Group, { name: 'group' })
  findOne(@Args('id') id: string) {
    return this.groupsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'myGroups' })
  findMyGroups(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    return this.groupsService.findGroupsByUser(userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Group], { name: 'createdGroups' })
  findCreatedByMe(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    return this.groupsService.findCreatedByUser(userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Group)
  updateGroup(
    @Args('input') updateGroupInput: UpdateGroupInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.groupsService.updateGroup(userId, updateGroupInput);
  }
}
