import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { GroupsService } from './groups.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { Int } from '@nestjs/graphql';
import { FilterGroupInput } from './dto/filter-group.input';
import { GroupDto } from './dto/group.dto';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => GroupDto)
export class GroupsResolver {
  constructor(private readonly groupsService: GroupsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [GroupDto], { name: 'groups' })
  async findAll(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('query', { type: () => String, nullable: true }) query?: string,
    @Args('filters', { type: () => FilterGroupInput, nullable: true })
    filters?: FilterGroupInput,
  ): Promise<GroupDto[]> {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.groupsService.findAll(
      limit,
      skip,
      query,
      filters,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => [GroupDto], { name: 'joinedGroups' })
  async findJoinedGroups(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => FilterGroupInput, nullable: true })
    filters?: FilterGroupInput,
  ): Promise<GroupDto[]> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.groupsService.findJoinedGroups(
      limit,
      skip,
      filters,
      userId,
      authToken,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => GroupDto, { name: 'group' })
  async findOne(
    @Args('id') id: string,
    @Context() context: GqlContext,
  ): Promise<GroupDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.groupsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupDto)
  async createGroup(
    @Args('input') input: CreateGroupInput,
    @Context() context: GqlContext,
  ): Promise<GroupDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.groupsService.create(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupDto)
  async updateGroup(
    @Args('input') input: UpdateGroupInput,
    @Context() context: GqlContext,
  ): Promise<GroupDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return await this.groupsService.update(input, userId, authToken);
  }
}
