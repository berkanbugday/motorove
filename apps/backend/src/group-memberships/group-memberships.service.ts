import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { plainToClass } from 'class-transformer';
import { StorageService } from '../core/storage/storage.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { QueueService } from '../core/queue/queue.service';
import { GroupMembership } from './models/group-membership.model';

@Injectable()
export class GroupMembershipsService {
  private readonly logger = new Logger(GroupMembershipsService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private queueService: QueueService,
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
      const group = await this.prisma.group.findFirst({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

      if (!group) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'group',
        });
      }

      // Check if the user is already a member
      const existingMembership = group.memberships.find(
        (m) => m.userId === userId && m.isActive,
      );

      if (existingMembership) {
        ExceptionHelper.conflict('errors.group.already_member');
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
      const group = await this.prisma.group.findFirst({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

      if (!group) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'group',
        });
      }

      const isOwner = group.createdById === userId;

      if (isOwner) {
        ExceptionHelper.forbidden(
          'errors.group_membership.cannot_remove_yourself',
        );
      }

      const membershipToDelete = group.memberships.find(
        (m) => m.userId === userId && m.isActive,
      );

      if (!membershipToDelete) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'group_membership',
        });
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
      const group = await this.prisma.group.findFirst({
        where: { id: groupId, isActive: true },
        include: {
          memberships: true,
        },
      });

      if (!group) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'group',
        });
      }

      // Check if the admin user has admin rights
      const adminMembership = group.memberships.find(
        (m) =>
          m.userId === adminId &&
          m.role === GroupMemberRole.ADMIN &&
          m.isActive,
      );

      if (!adminMembership) {
        ExceptionHelper.forbidden('errors.common.forbidden');
      }

      // Check if the member exists
      const membershipToUpdate = group.memberships.find(
        (m) => m.userId === userId && m.isActive,
      );

      if (!membershipToUpdate) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'group_membership',
        });
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
        await this.queueService.addNotificationJob(
          {
            userId: updatedMembership.userId,
            title: 'Membership status updated',
            body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newRole}`,
            type: NotificationType.ADMIN_CHANGED_GROUP_MEMBER_ROLE,
            channel: NotificationChannel.PUSH,
            data: {
              groupId: updatedMembership.group.id,
              groupName: updatedMembership.group.name,
              role: newRole,
            } as Record<string, any>,
          },
          adminId,
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
      const membership = await this.prisma.groupMembership.findFirst({
        where: { id, isActive: true },
      });

      if (!membership) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'group_membership',
          id,
        });
      }

      // Update the membership status
      const updatedMembership = (await this.prisma.groupMembership.update({
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
      })) as GroupMembership;

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
