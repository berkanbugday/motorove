import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { AddMemberInput } from './dto/add-member.input';
import { ChangeMemberRoleInput } from './dto/change-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { UpdateInvitationStatusInput } from './dto/update-invitation-status.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';

@Resolver(() => GroupMembershipDto)
export class GroupMembershipsResolver {
  constructor(
    private readonly groupMembershipsService: GroupMembershipsService,
  ) {}

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async addMember(
    @Args('input') input: AddMemberInput,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.addMember(
      input.groupId,
      input.userId,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembershipDto)
  async removeMember(
    @Args('input') input: RemoveMemberInput,
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
  async updateInvitationStatus(
    @Args('input') input: UpdateInvitationStatusInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.updateInvitationStatus(
      input.groupId,
      input.userId,
      input.status,
      user.id,
    );
  }
}
