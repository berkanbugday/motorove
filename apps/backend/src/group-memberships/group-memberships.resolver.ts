import { Resolver, Mutation, Args, Query, Int, Context } from '@nestjs/graphql';
import { GroupMembershipsService } from './group-memberships.service';
import { AddMemberInput } from './dto/add-member.input';
import { ChangeMemberRoleInput } from './dto/change-member-role.input';
import { RemoveMemberInput } from './dto/remove-member.input';
import { UpdateGroupMembershipApprovalStatusInput } from './dto/update-group-membership-approval-status.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { GroupMembershipDto } from './dto/group-membership.dto';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => GroupMembershipDto)
export class GroupMembershipsResolver {
  constructor(
    private readonly groupMembershipsService: GroupMembershipsService,
  ) {}

  @UseGuards(JwtGuard)
  @Query(() => [GroupMembershipDto])
  async groupJoinRequests(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<GroupMembershipDto[]> {
    const userId = context.req.user.id;
    return await this.groupMembershipsService.groupJoinRequests(
      limit,
      skip,
      userId,
    );
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
  @Mutation(() => GroupMembershipDto)
  async updateGroupMembershipApprovalStatus(
    @Args('input') input: UpdateGroupMembershipApprovalStatusInput,
    @CurrentUser() user: User,
  ): Promise<GroupMembershipDto> {
    return await this.groupMembershipsService.updateApprovalStatus(
      input.id,
      input.status,
      user.id,
    );
  }
}
