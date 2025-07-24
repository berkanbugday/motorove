import { Injectable, NotFoundException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { StorageService } from '../core/storage/storage.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { InvitationStatus } from '../enums/models/invitation-status.enum';
import { FilterGroupInput } from './dto/filter-group.input';
import { Group } from './models/group.model';
import { GroupDto } from './dto/group.dto';
import { plainToClass } from 'class-transformer';
import { GroupPrivacy } from '../enums/models/group-privacy.enum';
import { GroupTag } from '../enums/models/group-tag.enum';

@Injectable()
export class GroupsService {
  private readonly logger = new Logger(GroupsService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll(
    limit?: number,
    skip?: number,
    query?: string,
    filters?: FilterGroupInput,
    userId?: string,
    authToken?: string,
  ): Promise<GroupDto[]> {
    try {
      const whereClause: any = {
        isActive: true,
        NOT: {
          memberships: {
            some: {
              userId,
              status: InvitationStatus.ACCEPTED,
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
              status: InvitationStatus.ACCEPTED,
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

      return await Promise.all(
        filteredGroups.map(async (group) =>
          this.mapToDto(group as Group, authToken),
        ),
      );
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
    authToken?: string,
  ): Promise<GroupDto[]> {
    try {
      const whereClause: any = {
        isActive: true,
        memberships: {
          some: {
            userId,
            status: InvitationStatus.ACCEPTED,
          },
        },
      };

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
              status: InvitationStatus.ACCEPTED,
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

      return await Promise.all(
        filteredGroups.map(async (group) =>
          this.mapToDto(group as Group, authToken),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to get joined groups`, error);
      throw error;
    }
  }

  async findOne(
    id: string,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
    try {
      const group = await this.prisma.group.findUnique({
        where: { id, isActive: true },
        include: {
          createdBy: true,
          city: true,
          memberships: {
            where: {
              status: InvitationStatus.ACCEPTED,
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
        throw new NotFoundException(`Group with ID ${id} not found`);
      }

      const groupDto = await this.mapToDto(group as Group, authToken);

      // Check if the user is a member of the group
      const membership = group.memberships.find(
        (membership) =>
          membership.user.id === userId &&
          membership.status === InvitationStatus.ACCEPTED,
      );

      const isMember = !!membership;
      const isAdmin = isMember && membership.role === GroupMemberRole.ADMIN;

      return {
        ...groupDto,
        isMember,
        isAdmin,
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
        logo: logoUrl,
        cover: coverUrl,
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

      const group = await this.prisma.group.create({
        data: prismaData,
        include: {
          createdBy: true,
          city: true,
        },
      });

      // Create an admin membership for the creator
      await this.prisma.groupMembership.create({
        data: {
          group: {
            connect: { id: group.id },
          },
          user: {
            connect: { id: userId },
          },
          role: GroupMemberRole.ADMIN,
          status: InvitationStatus.ACCEPTED,
          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },
        },
      });

      return this.mapToDto(group as Group, authToken);
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
              status: InvitationStatus.ACCEPTED,
            },
          },
        },
      });

      if (!existingGroup) {
        throw new NotFoundException(
          `Group with ID ${input.id} not found or you don't have permission to update it`,
        );
      }

      // Extract update data from input
      const updateData = { ...input };
      const id = updateData.id;

      delete (updateData as any).id;

      // Process images if provided
      if (updateData.logo?.includes('base64')) {
        updateData.logo = await this.storageService.processImageUpload(
          updateData.logo,
          'groups/logos',
          `logo-${existingGroup.id}`,
          authToken,
        );
      } else {
        delete updateData.logo;
      }

      if (updateData.cover?.includes('base64')) {
        updateData.cover = await this.storageService.processImageUpload(
          updateData.cover,
          'groups/covers',
          `cover-${existingGroup.id}`,
          authToken,
        );
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
              status: InvitationStatus.ACCEPTED,
            },
            include: {
              user: true,
            },
          },
        },
      });

      return this.mapToDto(updatedGroup as Group, authToken);
    } catch (error) {
      this.logger.error(`Failed to update group`, error);
      throw error;
    }
  }

  private async mapToDto(group: Group, authToken?: string): Promise<GroupDto> {
    let logoUrl = group.logo;
    let coverUrl = group.cover;

    try {
      if (group.logo) {
        logoUrl = await this.storageService.getSignedUrl(
          group.logo,
          60,
          authToken,
        );
      }

      if (group.cover) {
        coverUrl = await this.storageService.getSignedUrl(
          group.cover,
          60,
          authToken,
        );
      }
      if (group.memberships) {
        group.memberships = await Promise.all(
          group.memberships.map(async (membership) => ({
            ...membership,
            user: membership.user.avatar
              ? {
                  ...membership.user,
                  avatar: await this.storageService.getSignedUrl(
                    membership.user.avatar,
                    60,
                    authToken,
                  ),
                }
              : membership.user,
          })),
        );
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting signed URLs:', errorMessage);
    }

    return plainToClass(GroupDto, {
      ...group,
      logo: logoUrl,
      cover: coverUrl,
      membersCount: group.memberships.length,
      membersCapacity: group.membersCapacity,
    });
  }
}
