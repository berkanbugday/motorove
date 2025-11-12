import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessDto } from './dto/business.dto';
import { FilterBusinessInput } from './dto/filter-business.input';
import { plainToClass } from 'class-transformer';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { DayOfWeek } from '@motorove/shared/dist';

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Find all businesses within map viewport bounds (polygon)
   * Optimized for 100k+ users with proper indexing and ordering
   * REQUIRES bounds parameters to prevent returning all businesses
   *
   * @param filter - Filter parameters including bounds and limit
   * @returns Array of businesses within the viewport bounds
   */
  async findAll(filter: FilterBusinessInput): Promise<BusinessDto[]> {
    const {
      northEastLat,
      northEastLng,
      southWestLat,
      southWestLng,
      limit = 100,
      categories,
      minRating,
      isOpen,
      isOpen24h,
      searchQuery,
    } = filter;

    // Require bounds parameters - don't return all businesses
    if (
      northEastLat === undefined ||
      northEastLng === undefined ||
      southWestLat === undefined ||
      southWestLng === undefined
    ) {
      this.logger.warn(
        'Business query attempted without bounds parameters - returning empty array',
      );
      return [];
    }

    this.logger.log(
      `Fetching businesses for bounds: NE(${northEastLat}, ${northEastLng}), SW(${southWestLat}, ${southWestLng}), limit: ${limit}`,
    );

    const whereClause: any = {
      isActive: true,
      status: ApprovalStatus.ACCEPTED,
      addresses: {
        some: {
          latitude: {
            gte: southWestLat, // Greater than or equal to southwest latitude
            lte: northEastLat, // Less than or equal to northeast latitude
          },
          longitude: {
            gte: southWestLng, // Greater than or equal to southwest longitude
            lte: northEastLng, // Less than or equal to northeast longitude
          },
        },
      },
    };

    if (categories && categories.length > 0) {
      whereClause.category = {
        in: categories,
      };
    }

    if (isOpen24h) {
      whereClause.workingHours = {
        some: {
          isActive: true,
          isOpen24h: isOpen24h,
        },
      };
    }

    if (searchQuery) {
      whereClause.descriptions = {
        some: {
          isActive: true,
          description: {
            contains: searchQuery,
          },
        },
      };
    }

    if (isOpen) {
      const now = new Date();
      const currentDay = this.getDayOfWeek(now);
      const currentTime = this.formatTimeToHHMM(now);
      whereClause.workingHours = {
        some: {
          isActive: true,
          isOpen24h: false,
          dayOfWeek: currentDay,
          startHour: {
            lte: currentTime,
          },
          endHour: {
            gte: currentTime,
          },
        },
      };
    }

    // Query businesses within the bounding box (viewport polygon)
    // Limited to prevent performance issues with large result sets
    const businesses = await this.prisma.business.findMany({
      where: whereClause,
      include: {
        addresses: true,
        descriptions: {
          where: {
            isActive: true,
          },
        },
        workingHours: {
          where: {
            isActive: true,
          },
        },
        comments: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            rating: true,
          },
        },
      },
      // Order by name for consistent results
      orderBy: { name: 'asc' },
      // Limit results for performance optimization
      take: limit,
    });

    this.logger.log(`Found ${businesses.length} businesses in viewport`);

    // Map businesses with calculated average rating
    const businessesWithRating = businesses.map((business) => {
      const averageRating =
        business.comments.length > 0
          ? business.comments.reduce(
              (acc, comment) => acc + comment.rating,
              0,
            ) / business.comments.length
          : 0;
      const commentsCount = business.comments.length;

      return plainToClass(BusinessDto, {
        ...business,
        averageRating,
        commentsCount,
      });
    });

    // Filter by minimum average rating if specified
    const filteredBusinesses = minRating
      ? businessesWithRating.filter(
          (business) => business.averageRating >= minRating,
        )
      : businessesWithRating;

    this.logger.log(
      `Returning ${filteredBusinesses.length} businesses after rating filter`,
    );

    return filteredBusinesses;
  }

  async findOne(id: string): Promise<BusinessDto> {
    const business = await this.prisma.business.findFirst({
      where: {
        id,
        isActive: true,
        status: ApprovalStatus.ACCEPTED,
      },
      include: {
        addresses: true,
        descriptions: {
          where: {
            isActive: true,
          },
        },
        workingHours: {
          where: {
            isActive: true,
          },
        },
        comments: {
          where: {
            isActive: true,
          },
          select: {
            id: true,
            rating: true,
          },
        },
      },
    });
    if (!business) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'business',
      });
    }
    const averageRating =
      business.comments.length > 0
        ? business.comments.reduce((acc, comment) => acc + comment.rating, 0) /
          business.comments.length
        : 0;
    const commentsCount = business.comments.length;
    return plainToClass(BusinessDto, {
      ...business,
      averageRating,
      commentsCount,
    });
  }

  /**
   * Convert JavaScript day number (0-6) to DayOfWeek enum
   * JavaScript: 0 = Sunday, 1 = Monday, ..., 6 = Saturday
   */
  private getDayOfWeek(date: Date): DayOfWeek {
    const dayMap: Record<number, DayOfWeek> = {
      0: DayOfWeek.SUNDAY,
      1: DayOfWeek.MONDAY,
      2: DayOfWeek.TUESDAY,
      3: DayOfWeek.WEDNESDAY,
      4: DayOfWeek.THURSDAY,
      5: DayOfWeek.FRIDAY,
      6: DayOfWeek.SATURDAY,
    };
    return dayMap[date.getDay()];
  }

  /**
   * Format time to HH:MM format
   */
  private formatTimeToHHMM(date: Date): string {
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  }
}
