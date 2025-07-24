import { Resolver, Mutation, Args, Query, Int } from '@nestjs/graphql';
import { GroupMembershipsService } from './group-memberships.service';
import { AddMemberInput } from './dto/add-member.input';
import { ChangeMemberRoleInput } from './dto/change-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { UpdateInvitationStatusInput } from './dto/update-invitation-status.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { GroupMembershipDto } from './dto/group-membership.dto';

@Resolver(() => Boolean)
export class GroupMembershipsResolver {
  constructor(
    private readonly groupMembershipsService: GroupMembershipsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [GroupMembershipDto])
  async groupJoinRequests(
    @Args('limit', { type: () => Int }) limit: number,
    @Args('skip', { type: () => Int }) skip: number,
  ): Promise<GroupMembershipDto[]> {
    return await this.groupMembershipsService.getGroupJoinRequests(limit, skip);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async addMember(@Args('input') input: AddMemberInput): Promise<boolean> {
    return await this.groupMembershipsService.addMember(
      input.groupId,
      input.userId,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeMember(
    @Args('input') input: RemoveMemberInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.groupMembershipsService.removeMember(
      input.groupId,
      input.userId,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async changeMemberRole(
    @Args('input') input: ChangeMemberRoleInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.groupMembershipsService.changeMemberRole(
      input.groupId,
      input.userId,
      input.role,
      user.id,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async updateInvitationStatus(
    @Args('input') input: UpdateInvitationStatusInput,
    @CurrentUser() user: User,
  ): Promise<boolean> {
    return await this.groupMembershipsService.updateInvitationStatus(
      input.groupId,
      input.userId,
      input.status,
      user.id,
    );
  }
}
