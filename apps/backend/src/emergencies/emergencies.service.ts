import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEmergencyInput } from './dto/create-emergency.input';
import { EmergencyDto } from './dto/emergency.dto';
import { FilterEmergencyInput } from './dto/filter-emergency.input';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { plainToClass } from 'class-transformer';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { Language } from '@motorove/shared';

@Injectable()
export class EmergenciesService {
  private readonly logger = new Logger(EmergenciesService.name);

  constructor(
    private prisma: PrismaService,
    private profanityFilterService: ProfanityFilterService,
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
      },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency not found');
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

      const { type, descriptions, addresses } = input;

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
        },
        include: {
          descriptions: {
            where: {
              isActive: true,
            },
          },
          addresses: true,
        },
      });

      return plainToClass(EmergencyDto, emergency);
    } catch (error) {
      this.logger.error(
        `Error creating emergency: ${error instanceof Error ? error.message : 'Unknown error'}`,
      );
      throw new BadRequestException('Failed to create emergency');
    }
  }

  async remove(id: string, currentUserId: string): Promise<boolean> {
    const emergency = await this.prisma.emergency.findUnique({
      where: { id },
      select: { createdById: true },
    });

    if (!emergency) {
      throw new NotFoundException('Emergency not found');
    }

    if (emergency.createdById !== currentUserId) {
      throw new ForbiddenException('You can only delete your own emergencies');
    }

    await this.prisma.emergency.update({
      where: { id },
      data: { isActive: false },
    });

    this.logger.log(`Emergency ${id} deleted by user ${currentUserId}`);
    return true;
  }
}
