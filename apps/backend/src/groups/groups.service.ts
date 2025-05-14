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
import { GroupMembershipStatus } from 'src/enums/models/group-membership-status.enum';

@Injectable()
export class GroupsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

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

      // Upload to Supabase storage
      const contentType = this.getContentTypeFromBase64(base64Image);
      const filename = `${filePrefix}-${Date.now()}`;
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
      throw new BadRequestException(`Failed to upload image: ${error.message}`);
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

  async createGroup(
    userId: string,
    createGroupInput: CreateGroupInput,
    authToken?: string,
  ) {
    // Process images if they exist
    const logoUrl = await this.processImageUpload(
      createGroupInput.logo,
      'groups/logos',
      `logo-${userId}`,
      authToken,
    );

    const coverUrl = await this.processImageUpload(
      createGroupInput.cover,
      'groups/covers',
      `cover-${userId}`,
      authToken,
    );

    // Create group and set the creator as an admin member in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the group with proper type conversions
      const prismaData = {
        name: createGroupInput.name,
        description: createGroupInput.description,
        logo: logoUrl,
        cover: coverUrl,
        city: {
          connect: { id: createGroupInput.city.id },
        },
        privacy: createGroupInput.privacy,
        membersCapacity: createGroupInput.membersCapacity,
        tags: {
          connect: createGroupInput.tags.map((tag) => ({
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

      const group = await tx.group.create({
        data: prismaData,
      });

      // Add the creator as an admin member
      await tx.groupMembership.create({
        data: {
          group: {
            connect: { id: group.id },
          },
          user: {
            connect: { id: userId },
          },
          role: GroupMemberRole.ADMIN, // Creator is automatically an admin
          status: GroupMembershipStatus.APPROVED,
          createdBy: {
            connect: { id: userId },
          },
          updatedBy: {
            connect: { id: userId },
          },
        },
      });

      return await tx.group.findUnique({
        where: { id: group.id },
        include: {
          createdBy: true,
          city: true,
          tags: true,
          memberships: {
            where: {
              status: GroupMembershipStatus.APPROVED,
            },
            include: {
              user: true,
            },
          },
        },
      });
    });
  }

  async updateGroup(
    userId: string,
    updateGroupInput: UpdateGroupInput,
    authToken?: string,
  ) {
    const { id, ...updateData } = updateGroupInput;

    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        city: true,
        tags: true,
      },
    });

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
      logo: logoUrl,
      cover: coverUrl,
      updatedBy: {
        connect: { id: userId },
      },
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
    await this.prisma.group.update({
      where: { id },
      data: processedUpdateData,
      include: {
        createdBy: true,
        city: true,
        tags: true,
        memberships: {
          where: {
            status: GroupMembershipStatus.APPROVED,
          },
          include: {
            user: true,
          },
        },
      },
    });

    return await this.findOne(id, userId, authToken);
  }

  async findAll(
    userId: string,
    authToken?: string,
    limit?: number,
    skip?: number,
  ) {
    const groups = await this.prisma.group.findMany({
      where: {
        memberships: {
          none: { userId, status: GroupMembershipStatus.APPROVED },
        },
        isActive: true,
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
            status: GroupMembershipStatus.APPROVED,
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

    return Promise.all(
      groups.map(async (group) => {
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
          console.error('Error getting signed URLs:', error.message);
        }

        return {
          ...group,
          logo: logoUrl,
          cover: coverUrl,
        };
      }),
    );
  }

  async findOne(id: string, userId: string, authToken?: string) {
    const group = await this.prisma.group.findUnique({
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
            status: GroupMembershipStatus.APPROVED,
          },
          include: {
            user: true,
          },
        },
      },
    });

    if (!group) {
      throw new NotFoundException(`Group with ID ${id} not found`);
    }

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
      console.error('Error getting signed URLs:', error.message);
    }

    // Check if the user is a member of the group
    const membership = group.memberships.find(
      (membership) =>
        membership.user.id === userId &&
        membership.status === GroupMembershipStatus.APPROVED,
    );

    const isMember = !!membership;
    const isAdmin = isMember && membership.role === GroupMemberRole.ADMIN;

    return {
      ...group,
      logo: logoUrl,
      cover: coverUrl,
      isMember,
      isAdmin,
    };
  }

  async findJoinedGroups(
    userId: string,
    authToken?: string,
    limit?: number,
    skip?: number,
  ) {
    const groups = await this.prisma.group.findMany({
      where: {
        memberships: {
          some: {
            userId,
            status: GroupMembershipStatus.APPROVED,
          },
        },
        isActive: true,
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
            status: GroupMembershipStatus.APPROVED,
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

    return Promise.all(
      groups.map(async (group) => {
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
          console.error('Error getting signed URLs:', error.message);
        }

        return {
          ...group,
          logo: logoUrl,
          cover: coverUrl,
        };
      }),
    );
  }

  async findCreatedByUser(userId: string) {
    return await this.prisma.group.findMany({
      where: {
        createdById: userId,
        isActive: true,
      },
      include: {
        createdBy: true,
        city: true,
        tags: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
