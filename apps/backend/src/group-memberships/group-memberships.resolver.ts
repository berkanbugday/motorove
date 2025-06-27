import { Resolver, Query, Mutation, Args, ID } from '@nestjs/graphql';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { AddGroupMemberInput } from './dto/add-group-member.input';
import { ChangeMemberRoleInput } from './dto/change-member-role.input';
import { RemoveGroupMemberInput } from './dto/remove-group-member.input';
import { UpdateMembershipStatusInput } from './dto/update-membership-status.input';
import { LeaveGroupInput } from './dto/leave-group.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { FilterGroupMembershipInput } from './dto/filter-group-membership.input';
import { CurrentUser } from 'src/auth/decorators/current-user.decorator';
import { User } from 'src/users/models/user.model';

@Resolver(() => GroupMembershipDto)
export class GroupMembershipsResolver {
  constructor(
    private readonly groupMembershipsService: GroupMembershipsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [GroupMembershipDto], { name: 'groupMemberships' })
  async findAll(
    @Args('filters', { type: () => FilterGroupMembershipInput, nullable: true })
    filters?: FilterGroupMembershipInput,
  ): Promise<GroupMembershipDto[]> {
    return await this.groupMembershipsService.findAll(filters);
  }

  @UseGuards(JwtGuard)
  @Query(() => GroupMembershipDto, { name: 'groupMembership' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async addMember(
    @Args('input') input: AddGroupMemberInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.addMember(
      input.groupId,
      input.userId,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async updateMemberStatus(
    @Args('input') input: UpdateMembershipStatusInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.updateMemberStatus(
      input.groupId,
      input.userId,
      input.status,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async updateMemberRole(
    @Args('input') input: ChangeMemberRoleInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.updateMemberRole(
      input.groupId,
      input.userId,
      input.role,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async removeMember(
    @Args('input') input: RemoveGroupMemberInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.removeMember(
      input.groupId,
      input.userId,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async leaveGroup(
    @Args('input') input: LeaveGroupInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.leaveGroup(
      input.groupId,
      user.id,
    );
  }
}
