import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { GroupMembershipDto } from './dto/group-membership.dto';
import { plainToClass } from 'class-transformer';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { QueueService } from '../core/queue/queue.service';
import { GroupMembership } from './models/group-membership.model';

@Injectable()
export class GroupMembershipsService {
  private readonly logger = new Logger(GroupMembershipsService.name);
  constructor(
    private prisma: PrismaService,
    private queueService: QueueService,
  ) {}

  async groupJoinRequests(
    limit?: number,
    skip?: number,
    userId?: string,
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

    return groupJoinRequests.map((membership) =>
      plainToClass(GroupMembershipDto, membership),
    );
  }

  async addMember(groupId: string, userId: string): Promise<boolean> {
    try {
      // Check if the group exists
      const group = await this.prisma.group.findFirst({
        where: { id: groupId, isActive: true },
        include: {
          memberships: {
            include: {
              user: true,
            },
          },
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
      const isPrivateGroup = group.privacy === GroupPrivacy.PRIVATE;
      const membershipStatus = isPrivateGroup
        ? ApprovalStatus.PENDING
        : ApprovalStatus.ACCEPTED;

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
          status: membershipStatus,
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
          status: membershipStatus,
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

      // Send notification based on group privacy
      try {
        const userFullName = `${membership.user.firstName} ${membership.user.lastName}`;

        // Send GROUP_JOIN_REQUEST to group admins
        const adminMembershipIds = group.memberships
          .filter(
            (m) =>
              m.role === GroupMemberRole.ADMIN &&
              m.isActive &&
              m.status === ApprovalStatus.ACCEPTED,
          )
          .map((admin) => admin.user.id);

        if (adminMembershipIds.length === 0) {
          return membership ? true : false;
        }

        const title = isPrivateGroup
          ? 'group.join_request.title'
          : 'group.user_joined.title';
        const body = isPrivateGroup
          ? 'group.join_request.body'
          : 'group.user_joined.body';
        const notificationType = isPrivateGroup
          ? NotificationType.GROUP_JOIN_REQUEST
          : NotificationType.USER_JOINED_GROUP;

        await this.queueService.addBulkNotificationJob(
          {
            userIds: adminMembershipIds,
            title,
            body,
            type: notificationType,
            channels: NotificationChannel.PUSH,
            data: {
              groupId: group.id,
              groupName: group.name,
              userId: userId,
              userFullName: userFullName,
            } as Record<string, any>,
          },
          userId,
        );
      } catch (error) {
        this.logger.error('Failed to send group join notification', error);
      }

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
          memberships: {
            include: {
              user: true,
            },
          },
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

      // Send ADMIN_REMOVED_GROUP_MEMBER notification to the removed user
      if (deletedMembership) {
        try {
          const userFullName = `${membershipToDelete.user.firstName} ${membershipToDelete.user.lastName}`;

          // Send GROUP_JOIN_REQUEST to group admins

          const adminMembership = group.memberships.find(
            (m) =>
              m.role === GroupMemberRole.ADMIN &&
              m.isActive &&
              m.status === ApprovalStatus.ACCEPTED &&
              m.userId === adminId,
          );

          const adminFullName = adminMembership
            ? `${adminMembership?.user.firstName} ${adminMembership?.user.lastName}`
            : '';

          const adminMembershipIds = group.memberships
            .filter(
              (m) =>
                m.role === GroupMemberRole.ADMIN &&
                m.isActive &&
                m.status === ApprovalStatus.ACCEPTED &&
                m.userId !== adminId,
            )
            .map((admin) => admin.user.id);
          if (adminMembershipIds.length === 0) {
            return deletedMembership ? true : false;
          }

          const isLeaveGroup = userId === adminId ? true : false;

          const title = isLeaveGroup
            ? 'group.user_left.title'
            : 'group.member_removed.title';
          const body = isLeaveGroup
            ? 'group.user_left.body'
            : 'group.member_removed.body';
          const notificationType = isLeaveGroup
            ? NotificationType.USER_LEAVE_GROUP
            : NotificationType.ADMIN_REMOVED_GROUP_MEMBER;

          await this.queueService.addBulkNotificationJob(
            {
              userIds: adminMembershipIds,
              title,
              body,
              type: notificationType,
              channels: NotificationChannel.PUSH,
              data: {
                groupId: group.id,
                groupName: group.name,
                userFullName: userFullName,
                adminFullName: adminFullName,
              } as Record<string, any>,
            },
            adminId,
          );
        } catch (error) {
          this.logger.error(
            'Failed to send member removed notification',
            error,
          );
        }
      }

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
        // Send ADMIN_CHANGED_GROUP_MEMBER_ROLE notification to the user
        try {
          await this.queueService.addNotificationJob(
            {
              userId: updatedMembership.userId,
              title: 'group.role_changed.title',
              body: 'group.role_changed.body',
              type: NotificationType.ADMIN_CHANGED_GROUP_MEMBER_ROLE,
              channel: NotificationChannel.PUSH,
              data: {
                groupId: updatedMembership.group.id,
                groupName: updatedMembership.group.name,
                userFullName: `${updatedMembership.user.firstName} ${updatedMembership.user.lastName}`,
                role: newRole,
              } as Record<string, any>,
            },
            adminId,
          );
        } catch (error) {
          this.logger.error('Failed to send role changed notification', error);
        }
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
        include: {
          group: true,
          user: true,
        },
      })) as GroupMembership;

      // Send GROUP_JOIN_REQUEST_ACCEPTED notification when request is accepted
      if (newStatus === ApprovalStatus.ACCEPTED) {
        try {
          await this.queueService.addNotificationJob(
            {
              userId: updatedMembership.userId,
              title: 'group.join_request_accepted.title',
              body: 'group.join_request_accepted.body',
              type: NotificationType.GROUP_JOIN_REQUEST_ACCEPTED,
              channel: NotificationChannel.PUSH,
              data: {
                groupId: updatedMembership.groupId,
                groupName: updatedMembership.group.name,
              } as Record<string, any>,
            },
            adminId,
          );
        } catch (error) {
          this.logger.error(
            'Failed to send join request accepted notification',
            error,
          );
        }
      }

      return plainToClass(GroupMembershipDto, updatedMembership);
    } catch (error) {
      this.logger.error(`Failed to update member status`, error);
      throw error;
    }
  }
}
