import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateWarningInput } from './dto/create-warning.input';
import { WarningDto } from './dto/warning.dto';
import { FilterWarningInput } from './dto/filter-warning.input';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { plainToClass } from 'class-transformer';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { Language } from '@motorove/shared';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { QueueService } from '../core/queue/queue.service';
import { UserLocationsService } from '../user-locations/user-locations.service';
import { UserDto } from 'src/users/dto/user.dto';
import { WarningAddressDto } from './dto/warning-address.dto';
import { WarningDescriptionDto } from './dto/warning-description.dto';

@Injectable()
export class WarningsService {
  private readonly logger = new Logger(WarningsService.name);

  constructor(
    private prisma: PrismaService,
    private profanityFilterService: ProfanityFilterService,
    private queueService: QueueService,
    private userLocationsService: UserLocationsService,
  ) {}

  /**
   * Find all warnings within map viewport bounds (polygon)
   * Optimized for map-based queries with proper indexing and ordering
   * REQUIRES bounds parameters to prevent returning all warnings
   *
   * @param filter - Filter parameters including bounds, type, and limit
   * @returns Array of warnings within the viewport bounds
   */
  async findAll(filter: FilterWarningInput): Promise<WarningDto[]> {
    const {
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
      limit = 100,
      type,
    } = filter;

    // Require bounds parameters - don't return all warnings
    if (
      northEastLat === undefined ||
      northEastLng === undefined ||
      southWestLat === undefined ||
      southWestLng === undefined
    ) {
      this.logger.warn(
        'Warning query attempted without bounds parameters - returning empty array',
      );
      return [];
    }

    this.logger.log(
      `Fetching warnings for bounds: NE(${northEastLat}, ${northEastLng}), SW(${southWestLat}, ${southWestLng}), limit: ${limit}`,
    );

    const whereClause = {
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
      ...(type && { type }),
    };

    // Query warnings within the bounding box (viewport polygon)
    const warnings = await this.prisma.warning.findMany({
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

    this.logger.log(`Found ${warnings.length} warnings in viewport`);

    // Filter profanity from warning descriptions
    const filteredWarnings = warnings.map((warning) => {
      if (warning.descriptions && warning.descriptions.length > 0) {
        warning.descriptions = warning.descriptions.map((desc) => ({
          ...desc,
          description: this.profanityFilterService.filterText(desc.description),
        }));
      }
      return warning;
    });

    return filteredWarnings.map((warning) => plainToClass(WarningDto, warning));
  }

  async findOne(id: string): Promise<WarningDto> {
    const warning = await this.prisma.warning.findFirst({
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

    if (!warning) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'warning',
      });
    }

    // Filter profanity from warning descriptions
    if (warning.descriptions && warning.descriptions.length > 0) {
      warning.descriptions = warning.descriptions.map((desc) => ({
        ...desc,
        description: this.profanityFilterService.filterText(desc.description),
      }));
    }

    return plainToClass(WarningDto, warning);
  }

  async findMyWarnings(currentUserId: string): Promise<WarningDto[]> {
    this.logger.log(`Fetching warnings for user ${currentUserId}`);

    const warnings = await this.prisma.warning.findMany({
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

    // Filter profanity from warning descriptions
    const filteredWarnings = warnings.map((warning) => {
      if (warning.descriptions && warning.descriptions.length > 0) {
        warning.descriptions = warning.descriptions.map((desc) => ({
          ...desc,
          description: this.profanityFilterService.filterText(desc.description),
        }));
      }
      return warning;
    });

    return filteredWarnings.map((warning) => plainToClass(WarningDto, warning));
  }

  async create(
    input: CreateWarningInput,
    currentUserId: string,
  ): Promise<WarningDto> {
    try {
      this.logger.log(`Creating warning for user ${currentUserId}`);

      const { type, descriptions, addresses } = input;

      // Create warning with related data
      const warning = await this.prisma.warning.create({
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

      const warningDto = plainToClass(WarningDto, warning);

      // Find and notify nearby users (within 10km radius)
      // This runs asynchronously so it doesn't block warning creation
      if (warning.addresses.length > 0) {
        this.notifyNearbyUsers(
          currentUserId,
          warningDto.id,
          type,
          warningDto.createdBy,
          warningDto.addresses,
          warningDto.descriptions,
        ).catch((error) => {
          this.logger.error(
            `Failed to notify nearby users for warning ${warningDto.id}:`,
            error,
          );
        });
      }

      return warningDto;
    } catch (error) {
      this.logger.error(
        `Error creating warning: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      ExceptionHelper.badRequest('errors.common.failed_to_create', {
        resource: 'warning',
      });
    }
  }

  /**
   * Find nearby users and send warning notifications
   * Searches within 10km radius for users with recent locations (within last 10 minutes)
   */
  private async notifyNearbyUsers(
    excludeUserId: string,
    warningId: string,
    warningType: string,
    createdBy: Partial<UserDto>,
    addresses: WarningAddressDto[],
    descriptions?: WarningDescriptionDto[],
  ): Promise<void> {
    try {
      this.logger.log(
        `Finding nearby users for warning ${warningId} at (${addresses[0].latitude}, ${addresses[0].longitude})`,
      );

      // Find users within 10km radius with locations updated in last 10 minutes
      const nearbyUsers = await this.userLocationsService.findNearbyUsers(
        addresses[0].latitude,
        addresses[0].longitude,
        10, // 10km radius for warnings (smaller than emergency 20km)
        excludeUserId,
      );

      if (nearbyUsers.length === 0) {
        this.logger.log(`No nearby users found for warning ${warningId}`);
        return;
      }

      this.logger.log(
        `Found ${nearbyUsers.length} nearby users for warning ${warningId}`,
      );

      // Send warning notifications to nearby users
      await this.queueService.addBulkNotificationJob(
        {
          userIds: nearbyUsers,
          title: 'warning.title',
          body: 'warning.body',
          type: NotificationType.WARNING,
          channels: NotificationChannel.PUSH,
          data: {
            warningId,
            warningType,
            userFullName: `${createdBy.firstName} ${createdBy.lastName}`,
            addresses: addresses.map((addr) => ({
              address: addr.address,
              language: addr.language,
            })),
            descriptions:
              descriptions?.map((desc) => ({
                description: desc.description,
                language: desc.language,
              })) || [],
          } as Record<string, any>,
        },
        excludeUserId,
      );

      this.logger.log(
        `Sent warning notifications to ${nearbyUsers.length} nearby users`,
      );
    } catch (error) {
      this.logger.error(
        `Failed to notify nearby users for warning ${warningId}:`,
        error,
      );
      // Don't throw - we don't want to fail warning creation if notification fails
    }
  }

  async remove(id: string, currentUserId: string): Promise<boolean> {
    const warning = await this.prisma.warning.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!warning) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'warning',
      });
    }

    if (warning.createdById !== currentUserId) {
      ExceptionHelper.forbidden('errors.warning.cannot_delete');
    }

    await this.prisma.warning.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Warning ${id} deleted by user ${currentUserId}`);
    return true;
  }
}
