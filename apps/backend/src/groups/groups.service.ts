import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
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
      if (filters?.privacy && filters.privacy !== 'ALL') {
        whereClause.privacy = filters.privacy;
      }

      // Skip tag filtering for now since it's causing issues with the enum

      const groups = (await this.prisma.group.findMany({
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
      })) as unknown as Group[];

      // Filter manually by tags if needed
      let filteredGroups = groups;
      if (filters && filters.tags && filters.tags.length > 0) {
        filteredGroups = groups.filter((group) => {
          // Make sure both arrays exist
          if (!group.tags || !filters.tags) return false;
          // Check if any tag from filters exists in group tags
          return group.tags.some((tag) => filters.tags!.includes(tag));
        });
      }

      return await Promise.all(
        filteredGroups.map(async (group) => this.mapToDto(group, authToken)),
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
            ...(filters?.role && filters.role !== 'ALL'
              ? {
                  role: filters.role,
                }
              : {}),
          },
        },
      };

      // Add city filter if provided
      if (filters?.cityId && filters.cityId !== null) {
        whereClause.city = { id: filters.cityId };
      }

      // Add privacy filter if provided
      if (filters?.privacy && filters.privacy !== 'ALL') {
        whereClause.privacy = filters.privacy;
      }

      // Skip tag filtering for now since it's causing issues with the enum

      const groups = (await this.prisma.group.findMany({
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
      })) as unknown as Group[];

      // Filter manually by tags if needed
      let filteredGroups = groups;
      if (filters && filters.tags && filters.tags.length > 0) {
        filteredGroups = groups.filter((group) => {
          // Make sure both arrays exist
          if (!group.tags || !filters.tags) return false;
          // Check if any tag from filters exists in group tags
          return group.tags.some((tag) => filters.tags!.includes(tag));
        });
      }

      return await Promise.all(
        filteredGroups.map(async (group) => this.mapToDto(group, authToken)),
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
      const group = (await this.prisma.group.findUnique({
        where: { id, isActive: true },
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
      })) as unknown as Group;

      if (!group) {
        throw new NotFoundException(`Group with ID ${id} not found`);
      }

      const groupDto = await this.mapToDto(group, authToken);

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
      const logoUrl = await this.processImageUpload(
        input.logo,
        'groups/logos',
        `logo-${userId}`,
        authToken,
      );

      const coverUrl = await this.processImageUpload(
        input.cover,
        'groups/covers',
        `cover-${userId}`,
        authToken,
      );

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
        tags: input.tags, // Now directly using the enum array
        createdBy: {
          connect: { id: userId },
        },
        updatedBy: {
          connect: { id: userId },
        },
      };

      const group = (await this.prisma.group.create({
        data: prismaData,
        include: {
          createdBy: true,
          city: true,
        },
      })) as unknown as Group;

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

      return this.mapToDto(group, authToken);
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
      const existingGroup = (await this.prisma.group.findFirst({
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
      })) as unknown as Group;

      if (!existingGroup) {
        throw new NotFoundException(
          `Group with ID ${input.id} not found or you don't have permission to update it`,
        );
      }

      // Extract update data from input
      const updateData = { ...input };
      const id = updateData.id;
      // Use a separate variable instead of deleting
      const updateDataWithoutId = { ...updateData };
      delete (updateDataWithoutId as any).id;

      // Process images if provided
      if (updateDataWithoutId.logo !== undefined) {
        updateDataWithoutId.logo = await this.processImageUpload(
          updateDataWithoutId.logo,
          'groups/logos',
          `logo-${existingGroup.id}`,
          authToken,
        );
      }

      if (updateDataWithoutId.cover !== undefined) {
        updateDataWithoutId.cover = await this.processImageUpload(
          updateDataWithoutId.cover,
          'groups/covers',
          `cover-${existingGroup.id}`,
          authToken,
        );
      }

      // Build the update object
      const updateObject: any = {
        ...updateDataWithoutId,
        updatedBy: {
          connect: { id: userId },
        },
      };

      // Handle cityId separately
      if (updateDataWithoutId.cityId) {
        updateObject.city = {
          connect: { id: updateDataWithoutId.cityId },
        };
        delete updateObject.cityId;
      }

      const updatedGroup = (await this.prisma.group.update({
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
      })) as unknown as Group;

      return this.mapToDto(updatedGroup, authToken);
    } catch (error) {
      this.logger.error(`Failed to update group`, error);
      throw error;
    }
  }

  // Process base64 image and upload to Supabase storage
  private async processImageUpload(
    base64Image: string | null | undefined,
    path: string,
    filePrefix: string,
    authToken?: string,
  ): Promise<string | undefined> {
    if (!base64Image) return undefined;

    try {
      // Check if it's a URL or base64 data
      if (base64Image.startsWith('http')) {
        return base64Image; // Already a URL, just return it
      }

      // Extract content type
      const contentType = this.getContentTypeFromBase64(base64Image);
      const filename = `${filePrefix}-${Date.now()}`;

      // Upload to Supabase storage
      const imageUrl = await this.storageService.uploadFile(
        base64Image,
        path,
        {
          contentType,
          filename,
        },
        authToken,
      );

      return imageUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`);
    }
  }

  // Extract content type from base64 data
  private getContentTypeFromBase64(base64Data: string): string {
    if (base64Data.includes('data:')) {
      const matches = base64Data.match(
        /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/,
      );
      if (matches && matches.length > 1) {
        return matches[1];
      }
    }
    return 'image/jpeg'; // Default
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      console.error('Error getting signed URLs:', errorMessage);
    }

    return plainToClass(GroupDto, {
      ...group,
      logo: logoUrl,
      cover: coverUrl,
    });
  }
}
