import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyInput } from './dto/create-emergency.input';
import { EmergencyDto } from './dto/emergency.dto';
import { FilterEmergencyInput } from './dto/filter-emergency.input';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { plainToClass } from 'class-transformer';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import {
  Language,
  NotificationChannel,
  NotificationType,
} from '@motorove/shared';
import { QueueService } from '../core/queue/queue.service';

@Injectable()
export class EmergenciesService {
  private readonly logger = new Logger(EmergenciesService.name);

  constructor(
    private prisma: PrismaService,
    private profanityFilterService: ProfanityFilterService,
    private queueService: QueueService,
  ) {}

  /**
   * Find all emergencies within map viewport bounds (polygon)
   * Optimized for map-based queries with proper indexing and ordering
   * REQUIRES bounds parameters to prevent returning all emergencies
   *
   * @param filter - Filter parameters including bounds, type, and limit
   * @returns Array of emergencies within the viewport bounds
   */
  async findAll(filter: FilterEmergencyInput): Promise<EmergencyDto[]> {
    const {
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
      limit = 100,
      type,
    } = filter;

    // Require bounds parameters - don't return all emergencies
    if (
      northEastLat === undefined ||
      northEastLng === undefined ||
      southWestLat === undefined ||
      southWestLng === undefined
    ) {
      this.logger.warn(
        'Emergency query attempted without bounds parameters - returning empty array',
      );
      return [];
    }

    this.logger.log(
      `Fetching emergencies for bounds: NE(${northEastLat}, ${northEastLng}), SW(${southWestLat}, ${southWestLng}), limit: ${limit}`,
    );

    const whereClause: any = {
      isActive: true,
      status: ApprovalStatus.ACCEPTED,
      addresses: {
        some: {
          latitude: {
            gte: southWestLat,
            lte: northEastLat,
          },
          longitude: {
            gte: southWestLng,
            lte: northEastLng,
          },
        },
      },
    };

    if (type) {
      whereClause.type = type;
    }

    // Query emergencies within the bounding box (viewport polygon)
    const emergencies = await this.prisma.emergency.findMany({
      where: whereClause,
      include: {
        descriptions: {
          where: {
            isActive: true,
          },
        },
        addresses: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });

    this.logger.log(`Found ${emergencies.length} emergencies in viewport`);

    // Filter profanity from emergency descriptions
    const filteredEmergencies = emergencies.map((emergency) => {
      if (emergency.descriptions && emergency.descriptions.length > 0) {
        emergency.descriptions = emergency.descriptions.map((desc) => ({
          ...desc,
          description: this.profanityFilterService.filterText(desc.description),
        }));
      }
      return emergency;
    });

    return filteredEmergencies.map((emergency) =>
      plainToClass(EmergencyDto, emergency),
    );
  }

  async findOne(id: string): Promise<EmergencyDto> {
    const emergency = await this.prisma.emergency.findFirst({
      where: {
        id,
        isActive: true,
        status: ApprovalStatus.ACCEPTED,
      },
      include: {
        descriptions: {
          where: {
            isActive: true,
          },
        },
        addresses: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
    });

    if (!emergency) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'emergency',
      });
    }

    // Filter profanity from emergency descriptions
    if (emergency.descriptions && emergency.descriptions.length > 0) {
      emergency.descriptions = emergency.descriptions.map((desc) => ({
        ...desc,
        description: this.profanityFilterService.filterText(desc.description),
      }));
    }

    return plainToClass(EmergencyDto, emergency);
  }

  async findMyEmergencies(currentUserId: string): Promise<EmergencyDto[]> {
    this.logger.log(`Fetching emergencies for user ${currentUserId}`);

    const emergencies = await this.prisma.emergency.findMany({
      where: {
        createdById: currentUserId,
        isActive: true,
      },
      include: {
        descriptions: {
          where: {
            isActive: true,
          },
        },
        addresses: true,
        createdBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Filter profanity from emergency descriptions
    const filteredEmergencies = emergencies.map((emergency) => {
      if (emergency.descriptions && emergency.descriptions.length > 0) {
        emergency.descriptions = emergency.descriptions.map((desc) => ({
          ...desc,
          description: this.profanityFilterService.filterText(desc.description),
        }));
      }
      return emergency;
    });

    return filteredEmergencies.map((emergency) =>
      plainToClass(EmergencyDto, emergency),
    );
  }

  async create(
    input: CreateEmergencyInput,
    currentUserId: string,
  ): Promise<EmergencyDto> {
    try {
      this.logger.log(`Creating emergency for user ${currentUserId}`);

      const { type, descriptions, addresses, selectedGroupIds } = input;

      // Create emergency with related data
      const emergency = await this.prisma.emergency.create({
        data: {
          type,
          status: ApprovalStatus.ACCEPTED,
          createdById: currentUserId,
          descriptions: descriptions
            ? {
                create: descriptions.map((desc) => ({
                  description: desc.description,
                  language: Language.TR,
                })),
              }
            : undefined,
          addresses: {
            create: addresses,
          },
          // Handle selected groups if provided
          selectedGroups: selectedGroupIds?.length
            ? {
                connect: selectedGroupIds.map((id) => ({ id })),
              }
            : undefined,
        },
        include: {
          descriptions: {
            where: {
              isActive: true,
            },
          },
          addresses: true,
          createdBy: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      });

      if (selectedGroupIds?.length) {
        // Get all members from invited groups with ACCEPTED status
        const groupMembers = await this.prisma.groupMembership.findMany({
          where: {
            groupId: {
              in: selectedGroupIds,
            },
            status: ApprovalStatus.ACCEPTED,
            isActive: true,
          },
          select: {
            userId: true,
          },
        });

        const uniqueUserIds = [
          ...new Set(groupMembers.map((member) => member.userId)),
        ];

        const groupMemberIds = uniqueUserIds.filter(
          (id) => id !== currentUserId,
        );

        if (groupMemberIds.length) {
          await this.queueService.addBulkNotificationJob(
            {
              userIds: groupMemberIds,
              title: 'emergency.title',
              body: 'emergency.body',
              type: NotificationType.EMERGENCY,
              channels: NotificationChannel.PUSH,
              data: {
                emergencyType: type,
                fullName: `${emergency.createdBy.firstName} ${emergency.createdBy.lastName}`,
                addresses: emergency.addresses.map((addr) => ({
                  address: addr.address,
                  language: addr.language,
                })),
                descriptions:
                  emergency.descriptions?.map((desc) => ({
                    description: desc.description,
                    language: desc.language,
                  })) || [],
              } as Record<string, any>,
            },
            currentUserId,
          );
        }
      }

      return plainToClass(EmergencyDto, emergency);
    } catch (error) {
      this.logger.error(
        `Error creating emergency: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      ExceptionHelper.badRequest('errors.common.failed_to_create', {
        resource: 'emergency',
      });
    }
  }

  async remove(id: string, currentUserId: string): Promise<boolean> {
    const emergency = await this.prisma.emergency.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!emergency) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'emergency',
      });
    }

    if (emergency.createdById !== currentUserId) {
      ExceptionHelper.forbidden('errors.emergency.cannot_delete');
    }

    await this.prisma.emergency.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Emergency ${id} deleted by user ${currentUserId}`);
    return true;
  }
}
