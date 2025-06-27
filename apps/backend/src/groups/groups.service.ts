import {
  Injectable,
  ForbiddenException,
  NotFoundException,
  BadRequestException,
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

@Injectable()
export class GroupsService {
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
    const groups = (await this.prisma.group.findMany({
      where: {
        memberships: {
          none: { userId, status: InvitationStatus.ACCEPTED },
        },
        isActive: true,
        ...(query
          ? {
              name: {
                contains: query,
                mode: 'insensitive',
              },
            }
          : {}),
        ...(filters?.tags && filters.tags.length > 0
          ? {
              tags: {
                some: {
                  id: {
                    in: filters.tags,
                  },
                },
              },
            }
          : {}),
        ...(filters?.city && filters.city !== null
          ? {
              city: {
                id: filters.city,
              },
            }
          : {}),
        ...(filters?.privacy && filters.privacy !== 'ALL'
          ? {
              privacy: filters.privacy,
            }
          : {}),
      },
      include: {
        createdBy: true,
        city: true,
        tags: {
          orderBy: {
            value: 'asc',
          },
        },
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

    return await Promise.all(
      groups.map(async (group) => this.mapToDto(group, authToken)),
    );
  }

  async findJoinedGroups(
    limit?: number,
    skip?: number,
    filters?: FilterGroupInput,
    userId?: string,
    authToken?: string,
  ): Promise<GroupDto[]> {
    const groups = (await this.prisma.group.findMany({
      where: {
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
        isActive: true,
        ...(filters?.tags && filters.tags.length > 0
          ? {
              tags: {
                some: {
                  id: {
                    in: filters.tags,
                  },
                },
              },
            }
          : {}),
        ...(filters?.city && filters.city !== null
          ? {
              city: {
                id: filters.city,
              },
            }
          : {}),
        ...(filters?.privacy && filters.privacy !== 'ALL'
          ? {
              privacy: filters.privacy,
            }
          : {}),
      },
      include: {
        createdBy: true,
        city: true,
        tags: {
          orderBy: {
            value: 'asc',
          },
        },
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

    return await Promise.all(
      groups.map(async (group) => this.mapToDto(group, authToken)),
    );
  }

  async findOne(
    id: string,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
    const group = (await this.prisma.group.findUnique({
      where: { id, isActive: true },
      include: {
        createdBy: true,
        city: true,
        tags: {
          orderBy: {
            value: 'asc',
          },
        },
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
  }

  async create(
    input: CreateGroupInput,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
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

    // Create group and set the creator as an admin member in a transaction
    const createdGroup = (await this.prisma.$transaction(async (tx) => {
      // Create the group with proper type conversions
      const prismaData = {
        name: input.name,
        description: input.description,
        logo: logoUrl,
        cover: coverUrl,
        city: {
          connect: { id: input.city.id },
        },
        privacy: input.privacy,
        membersCapacity: input.membersCapacity,
        tags: {
          connect: input.tags.map((tag) => ({
            id: tag.id,
          })),
        },
        createdBy: {
          connect: { id: userId },
        },
        updatedBy: {
          connect: { id: userId },
        },
      };

      const createdGroup = (await tx.group.create({
        data: prismaData,
      })) as unknown as Group;

      // Add the creator as an admin member
      await tx.groupMembership.create({
        data: {
          group: {
            connect: { id: createdGroup.id },
          },
          user: {
            connect: { id: userId },
          },
          role: GroupMemberRole.ADMIN, // Creator is automatically an admin
          status: InvitationStatus.ACCEPTED,
          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },
        },
      });

      return createdGroup;
    })) as unknown as Group;

    return await this.mapToDto(createdGroup, authToken);
  }

  async update(
    input: UpdateGroupInput,
    userId: string,
    authToken?: string,
  ): Promise<GroupDto> {
    const { id, ...updateData } = input;

    // Check if the group exists
    const group = (await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        city: true,
        tags: true,
      },
    })) as unknown as Group;

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

    // Check if the user is the creator of the group
    if (group.createdBy.id !== userId) {
      throw new ForbiddenException(
        'You are not authorized to update this group',
      );
    }

    // Process images if they exist
    let logoUrl = updateData.logo;
    let coverUrl = updateData.cover;

    if (updateData.logo && updateData.logo !== group.logo) {
      logoUrl = await this.processImageUpload(
        updateData.logo,
        'groups/logos',
        `logo-${userId}`,
        authToken,
      );
    }

    if (updateData.cover && updateData.cover !== group.cover) {
      coverUrl = await this.processImageUpload(
        updateData.cover,
        'groups/covers',
        `cover-${userId}`,
        authToken,
      );
    }

    // Handle enum conversions
    const processedUpdateData: Record<string, unknown> = {
      ...updateData,
      logo: logoUrl?.startsWith('groups/logos') ? logoUrl : group.logo,
      cover: coverUrl?.startsWith('groups/covers') ? coverUrl : group.cover,
      updatedBy: {
        connect: { id: userId },
      },
      updatedAt: new Date(),
    };

    if (updateData.city && 'id' in updateData.city) {
      processedUpdateData.city = {
        connect: { id: updateData.city.id },
      };
    }

    if (updateData.privacy) {
      processedUpdateData.privacy = updateData.privacy;
    }

    if (updateData.tags && Array.isArray(updateData.tags)) {
      processedUpdateData.tags = {
        disconnect: group.tags.map((tag) => ({
          id: tag.id,
        })),
        connect: updateData.tags.map((tag) => ({
          id: tag.id,
        })),
      };
    }

    // Update the group
    const updatedGroup = (await this.prisma.group.update({
      where: { id },
      data: processedUpdateData,
      include: {
        createdBy: true,
        city: true,
        tags: true,
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

    return await this.mapToDto(updatedGroup, authToken);
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

    return {
      ...group,
      logo: logoUrl,
      cover: coverUrl,
    };
  }
}
