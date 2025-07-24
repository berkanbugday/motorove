import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { InvitationStatus } from '../enums/models/invitation-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
// import { NotificationType } from '../enums/models/notification-type.enum';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { GroupMembership } from './models/group-membership.model';
import { plainToClass } from 'class-transformer';
// import { NotificationChannel } from '../enums/models/notification-channel.enum';

@Injectable()
export class GroupMembershipsService {
  private readonly logger = new Logger(GroupMembershipsService.name);
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
  ) {}

  async addMember(
    groupId: string,
    userId: string,
  ): Promise<GroupMembershipDto> {
    try {
      // Check if the group exists
      const group = await this.prisma.group.findUnique({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

      if (!group) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }

      // Check if the user is already a member
      const existingMembership = group.memberships.find(
        (m) => m.userId === userId,
      );

      if (existingMembership) {
        throw new ConflictException('User is already a member of this group');
      }

      // Add the user as a member
      const membership = await this.prisma.groupMembership.create({
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
            connect: { id: userId },
          },
        },
        include: {
          group: true,
          user: true,
        },
      });

      return this.mapToDto(membership as GroupMembership);
    } catch (error) {
      this.logger.error(`Failed to add member to group`, error);
      throw error;
    }
  }

  async removeMember(
    groupId: string,
    userId: string,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    try {
      // Check if the group exists
      const group = await this.prisma.group.findUnique({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

      if (!group) {
        throw new NotFoundException(`Group with ID ${groupId} not found`);
      }

      const isAdmin = group.memberships.find(
        (m) => m.userId === adminId && m.role === GroupMemberRole.ADMIN,
      );

      if (isAdmin && isAdmin.userId === userId) {
        throw new ForbiddenException(
          'You cannot remove yourself from the group',
        );
      }

      const membershipToDelete = group.memberships.find(
        (m) => m.userId === userId,
      );

      if (!membershipToDelete) {
        throw new NotFoundException(
          `Member with ID ${userId} not found in this group`,
        );
      }

      // Delete the membership
      const deletedMembership = await this.prisma.groupMembership.delete({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        include: {
          group: true,
          user: true,
        },
      });

      return this.mapToDto(deletedMembership as GroupMembership);
    } catch (error) {
      this.logger.error(`Failed to remove member from group`, error);
      throw error;
    }
  }

  async updateMemberRole(
    groupId: string,
    userId: string,
    newRole: GroupMemberRole,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    try {
      // Check if the group exists
      const group = await this.prisma.group.findUnique({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

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
      const updatedMembership = await this.prisma.groupMembership.update({
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
        },
      });

      // if (updatedMembership.role === newRole) {
      //   // Send notification to the user
      //   await this.notificationsService.create(
      //     {
      //       userId,
      //       title: 'Membership status updated',
      //       body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newRole}`,
      //       type: NotificationType.GROUP_MEMBERSHIP_ROLE_UPDATED,
      //       channel: NotificationChannel.PUSH,
      //       data: JSON.stringify({
      //         groupId: updatedMembership.group.id,
      //         groupName: updatedMembership.group.name,
      //         role: newRole,
      //       }),
      //     },
      //     userId,
      //   );
      // }

      return this.mapToDto(updatedMembership as GroupMembership);
    } catch (error) {
      this.logger.error(`Failed to update member role`, error);
      throw error;
    }
  }

  async updateInvitationStatus(
    groupId: string,
    userId: string,
    newStatus: InvitationStatus,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    try {
      // Check if the group exists
      const group = await this.prisma.group.findUnique({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

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
      const updatedMembership = await this.prisma.groupMembership.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
          status: InvitationStatus.PENDING,
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
        },
      });

      // Send notification to the user
      // await this.notificationsService.create(
      //   {
      //     userId,
      //     title: 'Membership status updated',
      //     body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newStatus}`,
      //     type: NotificationType.GROUP_MEMBERSHIP_STATUS_UPDATED,
      //     channel: NotificationChannel.PUSH,
      //     data: JSON.stringify({
      //       groupId: updatedMembership.group.id,
      //       groupName: updatedMembership.group.name,
      //       status: newStatus,
      //     }),
      //   },
      //   userId,
      // );

      return this.mapToDto(updatedMembership as GroupMembership);
    } catch (error) {
      this.logger.error(`Failed to update member status`, error);
      throw error;
    }
  }

  /**
   * Maps a GroupMembership entity from the database to a GroupMembershipDto
   */
  private mapToDto(membership: GroupMembership): GroupMembershipDto {
    return plainToClass(GroupMembershipDto, membership);
  }
}
