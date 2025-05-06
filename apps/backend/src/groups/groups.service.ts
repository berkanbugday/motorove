import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateGroupInput } from './dto/create-group.input';
import { UpdateGroupInput } from './dto/update-group.input';
import { $Enums } from '../../generated/prisma';

@Injectable()
export class GroupsService {
  constructor(private prisma: PrismaService) {}

  // These methods are placeholders until the Prisma schema is migrated
  // and the Prisma client is generated with the new Group model

  async createGroup(userId: string, createGroupInput: CreateGroupInput) {
    // Create group and set the creator as an admin member in a transaction
    return await this.prisma.$transaction(async (tx) => {
      // Create the group with proper type conversions
      const prismaData = {
        name: createGroupInput.name,
        description: createGroupInput.description,
        logo: createGroupInput.logo,
        cover: createGroupInput.cover,
        city: createGroupInput.city as unknown as $Enums.City,
        privacy: createGroupInput.privacy as unknown as $Enums.GroupPrivacy,
        membersCapacity: createGroupInput.membersCapacity,
        tags: createGroupInput.tags as unknown as $Enums.GroupTag[],
        createdBy: {
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
          role: 'ADMIN', // Creator is automatically an admin
        },
      });

      return await tx.group.findUnique({
        where: { id: group.id },
        include: {
          createdBy: true,
          memberships: {
            include: {
              user: true,
            },
          },
        },
      });
    });
  }

  async findAll() {
    return await this.prisma.group.findMany({
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findOne(id: string) {
    return await this.prisma.group.findUnique({
      where: { id },
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findGroupsByUser(userId: string) {
    return await this.prisma.group.findMany({
      where: {
        memberships: {
          some: {
            userId,
          },
        },
      },
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async findCreatedByUser(userId: string) {
    return await this.prisma.group.findMany({
      where: {
        creatorId: userId,
      },
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }

  async updateGroup(userId: string, updateGroupInput: UpdateGroupInput) {
    const { id, ...updateData } = updateGroupInput;

    // Check if the group exists
    const group = await this.prisma.group.findUnique({
      where: { id },
      include: { createdBy: true },
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

    // Handle enum conversions
    const processedUpdateData: any = { ...updateData };
    if (updateData.city) {
      processedUpdateData.city = updateData.city as unknown as $Enums.City;
    }
    if (updateData.privacy) {
      processedUpdateData.privacy =
        updateData.privacy as unknown as $Enums.GroupPrivacy;
    }
    if (updateData.tags) {
      processedUpdateData.tags =
        updateData.tags as unknown as $Enums.GroupTag[];
    }

    // Update the group
    return await this.prisma.group.update({
      where: { id },
      data: processedUpdateData,
      include: {
        createdBy: true,
        memberships: {
          include: {
            user: true,
          },
        },
      },
    });
  }
}
