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
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { NotificationsService } from '../notifications/notifications.service';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { plainToClass } from 'class-transformer';
import { StorageService } from '../core/storage/storage.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';

@Injectable()
export class GroupMembershipsService {
  private readonly logger = new Logger(GroupMembershipsService.name);
  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService,
    private storageService: StorageService,
  ) {}

  async groupJoinRequests(
    limit?: number,
    skip?: number,
    userId?: string,
    authToken?: string,
  ): Promise<GroupMembershipDto[]> {
    const groupJoinRequests = await this.prisma.groupMembership.findMany({
      where: {
        status: ApprovalStatus.PENDING,
        isActive: true,
        group: {
          isActive: true,
          memberships: {
            some: { userId, isActive: true, role: GroupMemberRole.ADMIN },
          },
        },
      },
      skip: skip || undefined,
      take: limit || undefined,
      include: {
        user: true,
        group: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });

    const groupJoinRequestsWithSignedUrls = await Promise.all(
      groupJoinRequests.map(async (membership) => ({
        ...membership,
        user: membership.user.avatar
          ? {
              ...membership.user,
              avatar: await this.storageService.getSignedUrl(
                membership.user.avatar,
                3600,
                authToken,
              ),
            }
          : membership.user,
      })),
    );

    return groupJoinRequestsWithSignedUrls.map((membership) =>
      plainToClass(GroupMembershipDto, membership),
    );
  }

  async addMember(groupId: string, userId: string): Promise<boolean> {
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
        (m) => m.userId === userId && m.isActive,
      );

      if (existingMembership) {
        throw new ConflictException('User is already a member of this group');
      }

      // Add the user as a member
      const membership = await this.prisma.groupMembership.upsert({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        update: {
          isActive: true,
          role: GroupMemberRole.MEMBER,
          status:
            group.privacy === GroupPrivacy.PRIVATE
              ? ApprovalStatus.PENDING
              : ApprovalStatus.ACCEPTED,
          updatedBy: {
            connect: { id: userId },
          },
          updatedAt: new Date(),
        },
        create: {
          group: {
            connect: { id: groupId },
          },
          user: {
            connect: { id: userId },
          },
          role: GroupMemberRole.MEMBER,
          status:
            group.privacy === GroupPrivacy.PRIVATE
              ? ApprovalStatus.PENDING
              : ApprovalStatus.ACCEPTED,
          createdBy: {
            connect: { id: userId },
          },
          updatedAt: new Date(),
        },
        include: {
          group: true,
          user: true,
        },
      });

      return membership ? true : false;
    } catch (error) {
      this.logger.error(`Failed to add member to group`, error);
      throw error;
    }
  }

  async removeMember(
    groupId: string,
    userId: string,
    adminId: string,
  ): Promise<boolean> {
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

      const isOwner = group.createdById === userId;

      if (isOwner) {
        throw new ForbiddenException(
          'You cannot remove yourself from the group',
        );
      }

      const membershipToDelete = group.memberships.find(
        (m) => m.userId === userId && m.isActive,
      );

      if (!membershipToDelete) {
        throw new NotFoundException(
          `Member with ID ${userId} not found in this group`,
        );
      }

      // Delete the membership
      const deletedMembership = await this.prisma.groupMembership.update({
        where: {
          groupId_userId: {
            groupId,
            userId,
          },
        },
        data: {
          isActive: false,
          updatedBy: {
            connect: { id: adminId },
          },
          updatedAt: new Date(),
        },
      });

      return deletedMembership ? true : false;
    } catch (error) {
      this.logger.error(`Failed to remove member from group`, error);
      throw error;
    }
  }

  async changeMemberRole(
    groupId: string,
    userId: string,
    newRole: GroupMemberRole,
    adminId: string,
  ): Promise<boolean> {
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
        (m) =>
          m.userId === adminId &&
          m.role === GroupMemberRole.ADMIN &&
          m.isActive,
      );

      if (!adminMembership) {
        throw new ForbiddenException(
          'You are not authorized to change member roles in this group',
        );
      }

      // Check if the member exists
      const membershipToUpdate = group.memberships.find(
        (m) => m.userId === userId && m.isActive,
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

      if (updatedMembership.role === newRole) {
        // Send notification to the user
        await this.notificationsService.create(
          {
            userId,
            title: 'Membership status updated',
            body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newRole}`,
            type: NotificationType.ADMIN_CHANGED_GROUP_MEMBER_ROLE,
            channel: NotificationChannel.PUSH,
            data: JSON.stringify({
              groupId: updatedMembership.group.id,
              groupName: updatedMembership.group.name,
              role: newRole,
            }),
          },
          userId,
        );
      }

      return updatedMembership ? true : false;
    } catch (error) {
      this.logger.error(`Failed to update member role`, error);
      throw error;
    }
  }

  async updateApprovalStatus(
    id: string,
    newStatus: ApprovalStatus,
    adminId: string,
  ): Promise<GroupMembershipDto> {
    try {
      // Check if the group exists
      const membership = await this.prisma.groupMembership.findUnique({
        where: { id, isActive: true },
      });

      if (!membership) {
        throw new NotFoundException(`Membership with ID ${id} not found`);
      }

      // Update the membership status
      const updatedMembership = await this.prisma.groupMembership.update({
        where: {
          id,
        },
        data: {
          status: newStatus,
          isActive: newStatus === ApprovalStatus.ACCEPTED,
          updatedBy: {
            connect: { id: adminId },
          },
          updatedAt: new Date(),
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

      return plainToClass(GroupMembershipDto, updatedMembership);
    } catch (error) {
      this.logger.error(`Failed to update member status`, error);
      throw error;
    }
  }
}
