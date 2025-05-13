import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { GroupMembershipsService } from './group-memberships.service';
import { GroupMembership } from './models/group-membership.model';
import { AddGroupMemberInput } from './dto/add-group-member.input';
import { ChangeMemberRoleInput } from './dto/change-member-role.input';
import { RemoveGroupMemberInput } from './dto/remove-group-member.input';
import { UpdateMembershipStatusInput } from './dto/update-membership-status.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';

interface RequestContext {
  req: {
    user: {
      id: string;
      [key: string]: any;
    };
  };
}

@Resolver(() => GroupMembership)
export class GroupMembershipsResolver {
  constructor(
    private readonly groupMembershipsService: GroupMembershipsService,
  ) {}

  @Query(() => [GroupMembership], { name: 'groupMemberships' })
  findAll() {
    return this.groupMembershipsService.findAll();
  }

  @Query(() => [GroupMembership], { name: 'groupMembers' })
  findByGroup(@Args('groupId') groupId: string) {
    return this.groupMembershipsService.findByGroup(groupId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [GroupMembership], { name: 'myGroupMemberships' })
  findByUser(@Context() context: RequestContext) {
    const userId: string = context.req.user.id;
    return this.groupMembershipsService.findByUser(userId);
  }

  @Query(() => GroupMembership, { name: 'groupMembership' })
  findOne(@Args('id') id: string) {
    return this.groupMembershipsService.findOne(id);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembership)
  addGroupMember(
    @Args('addGroupMemberInput') addGroupMemberInput: AddGroupMemberInput,
    @Context() context: RequestContext,
  ) {
    const adminId: string = context.req.user.id;
    return this.groupMembershipsService.addMember(
      addGroupMemberInput.groupId,
      addGroupMemberInput.userId,
      adminId,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembership)
  changeMemberRole(
    @Args('changeMemberRoleInput') changeMemberRoleInput: ChangeMemberRoleInput,
    @Context() context: RequestContext,
  ) {
    const adminId: string = context.req.user.id;
    return this.groupMembershipsService.changeMemberRole(
      changeMemberRoleInput.groupId,
      changeMemberRoleInput.memberId,
      changeMemberRoleInput.role,
      adminId,
    );
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async removeGroupMember(
    @Args('removeGroupMemberInput')
    removeGroupMemberInput: RemoveGroupMemberInput,
    @Context() context: RequestContext,
  ) {
    const adminId: string = context.req.user.id;
    const result = await this.groupMembershipsService.removeMember(
      removeGroupMemberInput.groupId,
      removeGroupMemberInput.memberId,
      adminId,
    );
    return !!result;
  }

  @UseGuards(JwtGuard)
  @Mutation(() => GroupMembership)
  updateMembershipStatus(
    @Args('updateMembershipStatusInput')
    updateStatusInput: UpdateMembershipStatusInput,
    @Context() context: RequestContext,
  ) {
    const adminId: string = context.req.user.id;
    return this.groupMembershipsService.updateMembershipStatus(
      updateStatusInput.groupId,
      updateStatusInput.memberId,
      updateStatusInput.status,
      adminId,
    );
  }
}
