import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessDto } from './dto/business.dto';
import { FilterBusinessInput } from './dto/filter-business.input';
import { plainToClass } from 'class-transformer';
import { Business } from '../businesses/models/business.model';

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

    // Query businesses within the bounding box (viewport polygon)
    // Limited to prevent performance issues with large result sets
    const businesses = (await this.prisma.business.findMany({
      where: {
        isActive: true,
        address: {
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
      include: {
        address: true,
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
      },
      // Order by name for consistent results
      orderBy: { name: 'asc' },
      // Limit results for performance optimization
      take: limit,
    })) as Business[];

    this.logger.log(`Found ${businesses.length} businesses in viewport`);

    return businesses.map((business) => plainToClass(BusinessDto, business));
  }

  async findOne(id: string): Promise<BusinessDto> {
    const business = (await this.prisma.business.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        address: true,
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
      },
    })) as Business;

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return plainToClass(BusinessDto, business);
  }
}
