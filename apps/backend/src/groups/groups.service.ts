import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { StorageService } from '../core/storage/storage.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { FilterGroupInput } from './dto/filter-group.input';
import { Group } from './models/group.model';
import { GroupDto } from './dto/group.dto';
import { plainToClass } from 'class-transformer';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { GroupTag } from '../enums/models/group-tag.enum';
import { ExceptionHelper } from 'src/core/exceptions/exception-helper.service';
import { QueueService } from '../core/queue/queue.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '@motorove/shared';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  private readonly imagePublicUrl: string;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private queueService: QueueService,
    private configService: ConfigService,
  ) {
    // Construct public URL from environment variables
    this.imagePublicUrl = `${this.configService.get<string>('IMAGE_PUBLIC_URL')}`;
  }

  async findAll(
    limit?: number,
    skip?: number,
    query?: string,
    filters?: FilterGroupInput,
    userId?: string,
  ): Promise<GroupDto[]> {
    try {
      const whereClause: any = {
        isActive: true,
        NOT: {
          memberships: {
            some: {
              userId,
              status: ApprovalStatus.ACCEPTED,
              isActive: true,
            },
          },
        },
      };

      // Add text search if provided
      if (query) {
        whereClause.OR = [
          { name: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
        ];
      }

      // Add city filter if provided
      if (filters?.cityId && filters.cityId !== null) {
        whereClause.city = { id: filters.cityId };
      }

      // Add privacy filter if provided
      if (filters?.privacy && filters.privacy !== GroupPrivacy.ALL) {
        whereClause.privacy = filters.privacy;
      }

      // Skip tag filtering for now since it's causing issues with the enum

      const groups = await this.prisma.group.findMany({
        where: whereClause,
        include: {
          createdBy: true,
          city: true,
          memberships: {
            where: {
              status: {
                in: [ApprovalStatus.ACCEPTED, ApprovalStatus.PENDING],
              },
              isActive: true,
            },
            include: {
              user: true,
            },
          },
        },
        take: limit || undefined,
        skip: skip || undefined,
        orderBy: {
          createdAt: 'desc', // Show newest groups first
        },
      });

      // Filter manually by tags if needed
      let filteredGroups = groups;
      if (filters && filters.tags && filters.tags.length > 0) {
        filteredGroups = groups.filter((group) => {
          // Make sure both arrays exist
          if (!group.tags || !filters.tags) return false;
          // Check if any tag from filters exists in group tags
          return group.tags.some((tag) =>
            filters.tags!.includes(tag as GroupTag),
          );
        });
      }

      return filteredGroups.map((group) => this.mapToDto(group as Group));
    } catch (error) {
      this.logger.error(`Failed to get groups`, error);
      throw error;
    }
  }

  async findJoinedGroups(
    limit?: number,
    skip?: number,
    filters?: FilterGroupInput,
    userId?: string,
  ): Promise<GroupDto[]> {
    try {
      const whereClause: any = {
        isActive: true,
        memberships: {
          some: {
            userId,
            status: ApprovalStatus.ACCEPTED,
            isActive: true,
          },
        },
      };

      if (filters?.role) {
        whereClause.memberships.some.role = {
          in: [filters.role],
        };
      }

      // Add city filter if provided
      if (filters?.cityId && filters.cityId !== null) {
        whereClause.city = { id: filters.cityId };
      }

      // Add privacy filter if provided
      if (filters?.privacy && filters.privacy !== GroupPrivacy.ALL) {
        whereClause.privacy = filters.privacy;
      }

      // Skip tag filtering for now since it's causing issues with the enum

      const groups = await this.prisma.group.findMany({
        where: whereClause,
        include: {
          createdBy: true,
          city: true,
          memberships: {
            where: {
              status: ApprovalStatus.ACCEPTED,
              isActive: true,
            },
            include: {
              user: true,
            },
          },
        },
        take: limit || undefined,
        skip: skip || undefined,
        orderBy: {
          createdAt: 'desc', // Show newest groups first
        },
      });

      // Filter manually by tags if needed
      let filteredGroups = groups;
      if (filters && filters.tags && filters.tags.length > 0) {
        filteredGroups = groups.filter((group) => {
          // Make sure both arrays exist
          if (!group.tags || !filters.tags) return false;
          // Check if any tag from filters exists in group tags
          return group.tags.some((tag) =>
            filters.tags!.includes(tag as GroupTag),
          );
        });
      }

      return filteredGroups.map((group) => this.mapToDto(group as Group));
    } catch (error) {
      this.logger.error(`Failed to get joined groups`, error);
      throw error;
    }
  }

  async findOne(id: string, userId: string): Promise<GroupDto> {
    try {
      const group = await this.prisma.group.findFirst({
        where: { id, isActive: true },
        include: {
          createdBy: true,
          city: true,
          memberships: {
            where: {
              status: {
                in: [ApprovalStatus.ACCEPTED, ApprovalStatus.PENDING],
              },
              isActive: true,
            },
            include: {
              user: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
      });

      if (!group) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'group',
          id,
        });
      }

      const groupDto = this.mapToDto(group as Group);

      // Check if the user is a member of the group
      const membership = group.memberships.find(
        (membership) => membership.user.id === userId,
      );

      const isMember =
        !!membership && membership.status === ApprovalStatus.ACCEPTED;
      const isAdmin = isMember && membership.role === GroupMemberRole.ADMIN;
      const isPendingMember =
        !!membership && membership.status === ApprovalStatus.PENDING;
      const isOwner = group.createdById === userId;

      return {
        ...groupDto,
        isMember,
        isAdmin,
        isPendingMember,
        isOwner,
      };
    } catch (error) {
      this.logger.error(`Failed to get group with ID ${id}`, error);
      throw error;
    }
  }

  async create(
    input: CreateGroupInput,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
    try {
      // Process images if they exist
      const logoUrl = input.logo
        ? await this.storageService.processImageUpload(
            input.logo,
            'groups/logos',
            `logo-${userId}`,
            authToken,
          )
        : null;

      const coverUrl = input.cover
        ? await this.storageService.processImageUpload(
            input.cover,
            'groups/covers',
            `cover-${userId}`,
            authToken,
          )
        : null;

      // Use explicit casting to handle type conflicts
      const prismaData: any = {
        name: input.name,
        description: input.description,
        logo: logoUrl ? `${this.imagePublicUrl}/${logoUrl}` : null,
        cover: coverUrl ? `${this.imagePublicUrl}/${coverUrl}` : null,
        city: {
          connect: { id: input.cityId },
        },
        privacy: input.privacy,
        membersCapacity: input.membersCapacity,
        tags: input.tags,
        createdBy: {
          connect: { id: userId },
        },
        updatedBy: {
          connect: { id: userId },
        },
      };

      const group = await this.prisma.$transaction(async (tx) => {
        const group = await tx.group.create({
          data: prismaData,
          include: {
            createdBy: true,
            city: true,
          },
        });

        // Create an admin membership for the creator
        await tx.groupMembership.create({
          data: {
            group: {
              connect: { id: group.id },
            },
            user: {
              connect: { id: userId },
            },
            role: GroupMemberRole.ADMIN,
            status: ApprovalStatus.ACCEPTED,
            createdBy: {
              connect: { id: userId },
            },
            updatedBy: {
              connect: { id: userId },
            },
          },
        });

        return group;
      });

      return this.mapToDto(group as Group);
    } catch (error) {
      this.logger.error(`Failed to create group`, error);
      throw error;
    }
  }

  async update(
    input: UpdateGroupInput,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
    try {
      // Verify that the group exists
      const existingGroup = await this.prisma.group.findFirst({
        where: {
          id: input.id,
          isActive: true,
          memberships: {
            some: {
              userId,
              role: GroupMemberRole.ADMIN,
              status: ApprovalStatus.ACCEPTED,
            },
          },
        },
      });

      if (!existingGroup) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'group',
          id: input.id,
        });
      }

      // Extract update data from input
      const updateData = { ...input };
      const id = updateData.id;

      delete (updateData as any).id;

      // Process images if provided
      if (updateData.logo?.includes('base64')) {
        const logoPath = await this.storageService.processImageUpload(
          updateData.logo,
          'groups/logos',
          `logo-${existingGroup.id}`,
          authToken,
        );
        updateData.logo = `${this.imagePublicUrl}/${logoPath}`;
      } else {
        delete updateData.logo;
      }

      if (updateData.cover?.includes('base64')) {
        const coverPath = await this.storageService.processImageUpload(
          updateData.cover,
          'groups/covers',
          `cover-${existingGroup.id}`,
          authToken,
        );
        updateData.cover = `${this.imagePublicUrl}/${coverPath}`;
      } else {
        delete updateData.cover;
      }

      // Build the update object
      const updateObject: any = {
        ...updateData,
        updatedBy: {
          connect: { id: userId },
        },
        updatedAt: new Date(),
      };

      // Handle cityId separately
      if (updateData.cityId) {
        updateObject.city = {
          connect: { id: updateData.cityId },
        };
        delete updateObject.cityId;
      }

      const updatedGroup = await this.prisma.group.update({
        where: { id },
        data: updateObject,
        include: {
          createdBy: true,
          city: true,
          memberships: {
            where: {
              status: ApprovalStatus.ACCEPTED,
              isActive: true,
            },
            include: {
              user: true,
            },
          },
        },
      });

      // Send GROUP_CHANGED_INFO notification to all group members
      try {
        const memberUserIds = updatedGroup.memberships
          .filter((m) => m.userId !== userId) // Don't notify the user who made the change
          .map((m) => m.userId);

        if (memberUserIds.length > 0) {
          await this.queueService.addBulkNotificationJob(
            {
              userIds: memberUserIds,
              title: 'group.info_changed.title',
              body: 'group.info_changed.body',
              type: NotificationType.GROUP_CHANGED_INFO,
              channels: NotificationChannel.PUSH,
              data: {
                groupId: updatedGroup.id,
                groupName: updatedGroup.name,
              } as Record<string, any>,
            },
            userId,
          );
        }
      } catch (error) {
        this.logger.error(
          'Failed to send group info changed notification',
          error,
        );
      }

      return this.mapToDto(updatedGroup as Group);
    } catch (error) {
      this.logger.error(`Failed to update group`, error);
      throw error;
    }
  }

  private mapToDto(group: Group): GroupDto {
    return plainToClass(GroupDto, {
      ...group,
      memberships: group?.memberships?.filter(
        (membership) => membership.status === ApprovalStatus.ACCEPTED,
      ),
      membersCount: group?.memberships?.filter(
        (membership) => membership.status === ApprovalStatus.ACCEPTED,
      ).length,
      membersCapacity: group.membersCapacity,
    });
  }
}
