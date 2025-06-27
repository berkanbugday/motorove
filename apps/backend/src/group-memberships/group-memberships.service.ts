import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { InvitationStatus } from '../enums/models/invitation-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { FilterGroupMembershipInput } from './dto/filter-group-membership.input';
import { GroupMembership } from './models/group-membership.model';
import { UserDto } from 'src/users/dto/user.dto';
import { GroupDto } from 'src/groups/dto/group.dto';
import { Group } from 'src/groups/models/group.model';

@Injectable()
export class GroupMembershipsService {
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async findAll(
    filters?: FilterGroupMembershipInput,
  ): Promise<GroupMembershipDto[]> {
    const { groupId, userId, role, status, isActive = true } = filters || {};

    const memberships = (await this.prisma.groupMembership.findMany({
      where: {
        ...(groupId && { groupId }),
        ...(userId && { userId }),
        ...(role && { role }),
        ...(status && { status }),
        isActive,
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership[];

    return await Promise.all(
      memberships.map((membership) => this.mapToDto(membership)),
    );
  }

  async findOne(id: string): Promise<GroupMembershipDto> {
    const membership = (await this.prisma.groupMembership.findUnique({
      where: { id },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    if (!membership) {
      throw new NotFoundException(`Group membership with ID ${id} not found`);
    }

    return this.mapToDto(membership);
  }

  async addMember(
    groupId: string,
    userId: string,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }
    // if (group.privacy === GroupPrivacy.PRIVATE) {
    //   // Check if the admin user has admin rights
    //   const adminMembership = group.memberships.find(
    //     (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    //   );

    //   if (!adminMembership) {
    //     throw new ForbiddenException(
    //       'You are not authorized to add members to this group',
    //     );
    //   }
    // }

    // Check if the user is already a member
    const existingMembership = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (existingMembership) {
      throw new ConflictException('User is already a member of this group');
    }

    // Add the user as a member
    const membership = (await this.prisma.groupMembership.create({
      data: {
        group: {
          connect: { id: groupId },
        },
        user: {
          connect: { id: userId },
        },
        role: GroupMemberRole.MEMBER,
        status:
          group.privacy === GroupPrivacy.PRIVATE
            ? InvitationStatus.PENDING
            : InvitationStatus.ACCEPTED,
        createdBy: {
          connect: { id: adminId },
        },
        updatedBy: {
          connect: { id: adminId },
        },
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    return this.mapToDto(membership);
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: GroupMemberRole,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to change member roles in this group',
      );
    }

    // Check if the member exists
    const membershipToUpdate = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToUpdate) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Update the member's role
    const updatedMembership = (await this.prisma.groupMembership.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        role: newRole,
        updatedBy: {
          connect: { id: adminId },
        },
        updatedAt: new Date(),
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    if (updatedMembership.role === newRole) {
      // Send notification to the user
      await this.notificationsService.createAndSendNotification(
        {
          userId,
          title: 'Membership status updated',
          body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newRole}`,
          type: NotificationType.GROUP_MEMBERSHIP_ROLE_UPDATED,
          data: JSON.stringify({
            groupId: updatedMembership.group.id,
            groupName: updatedMembership.group.name,
            role: newRole,
          }),
        },
        userId,
      );
    }

    return this.mapToDto(updatedMembership);
  }

  async removeMember(
    groupId: string,
    userId: string,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
        createdBy: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // If the user is removing themselves, allow it
    if (userId === adminId) {
      // Check if the user is the creator - creators can't leave their own groups
      if (group.createdBy.id === userId) {
        throw new ForbiddenException(
          'Group creators cannot leave their own groups. Transfer ownership first or delete the group.',
        );
      }

      const removedMembership = (await this.prisma.groupMembership.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        include: {
          group: true,
          user: true,
          createdBy: true,
          updatedBy: true,
        },
      })) as unknown as GroupMembership;

      return this.mapToDto(removedMembership);
    }

    // If removing another member, check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to remove members from this group',
      );
    }

    // Check if the member exists
    const membershipToDelete = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToDelete) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Delete the membership
    const deletedMembership = (await this.prisma.groupMembership.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    return this.mapToDto(deletedMembership);
  }

  async updateMemberStatus(
    groupId: string,
    userId: string,
    newStatus: InvitationStatus,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id: groupId, isActive: true },
      include: {
        memberships: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if the admin user has admin rights
    const adminMembership = group.memberships.find(
      (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
    );

    if (!adminMembership) {
      throw new ForbiddenException(
        'You are not authorized to update membership status in this group',
      );
    }

    // Check if the membership exists
    const membershipToUpdate = group.memberships.find(
      (m) => m.userId === userId,
    );

    if (!membershipToUpdate) {
      throw new NotFoundException(
        `Member with ID ${userId} not found in this group`,
      );
    }

    // Update the membership status
    const updatedMembership = (await this.prisma.groupMembership.update({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      data: {
        status: newStatus,
        updatedBy: {
          connect: { id: adminId },
        },
        updatedAt: new Date(),
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    // Send notification to the user
    await this.notificationsService.createAndSendNotification(
      {
        userId,
        title: 'Membership status updated',
        body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newStatus}`,
        type: NotificationType.GROUP_MEMBERSHIP_STATUS_UPDATED,
        data: JSON.stringify({
          groupId: updatedMembership.group.id,
          groupName: updatedMembership.group.name,
          status: newStatus,
        }),
      },
      userId,
    );

    return this.mapToDto(updatedMembership);
  }

  async leaveGroup(groupId: string, userId: string) {
    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id: groupId },
      include: {
        createdBy: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${groupId} not found`);
    }

    // Check if the user is the creator of the group
    if (group.createdBy.id === userId) {
      throw new ForbiddenException(
        'Group creators cannot leave their own groups. Transfer ownership first or delete the group.',
      );
    }

    // Check if the user is a member
    const membership = (await this.prisma.groupMembership.findUnique({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
    })) as unknown as GroupMembership;

    if (!membership) {
      throw new NotFoundException(`You are not a member of this group`);
    }

    // Leave the group
    const deletedMembership = (await this.prisma.groupMembership.delete({
      where: {
        groupId_userId: {
          groupId,
          userId,
        },
      },
      include: {
        group: true,
        user: true,
        createdBy: true,
        updatedBy: true,
      },
    })) as unknown as GroupMembership;

    return this.mapToDto(deletedMembership);
  }

  /**
   * Maps a GroupMembership entity from the database to a GroupMembershipDto
   */
  private mapToDto(membership: GroupMembership): GroupMembershipDto {
    return {
      id: membership.id,
      group: membership.group as unknown as GroupDto,
      user: membership.user as unknown as UserDto,
      role: membership.role,
      status: membership.status,
      joinedAt: membership.joinedAt,
    };
  }
}
