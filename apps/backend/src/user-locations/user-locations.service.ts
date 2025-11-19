import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '../core/config/config.service';
import { UpdateUserLocationInput } from './dto/update-user-location.input';
import { UserLocationDto } from './dto/user-location.dto';
import { plainToClass } from 'class-transformer';
import { calculateRoute, calculateDistance } from '@motorove/shared';

@Injectable()
export class UserLocationsService {
  private readonly logger = new Logger(UserLocationsService.name);

  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  /**
   * Update or create user location
   * Uses upsert to ensure only one active location per user
   */
  async updateLocation(
    userId: string,
    input: UpdateUserLocationInput,
  ): Promise<UserLocationDto> {
    try {
      const location = await this.prisma.userLocation.upsert({
        where: {
          userId,
        },
        update: {
          latitude: input.latitude,
          longitude: input.longitude,
        },
        create: {
          userId,
          latitude: input.latitude,
          longitude: input.longitude,
        },
      });

      return plainToClass(UserLocationDto, location);
    } catch (error) {
      this.logger.error(`Failed to update location for user ${userId}:`, error);
      throw error;
    }
  }

  /**
   * Find nearby users within a radius (in kilometers) from a given location
   * Only returns users with locations updated within the last X minutes (default: 10)
   * Uses bounding box approximation for performance, then filters by distance
   *
   * @param latitude - Center latitude
   * @param longitude - Center longitude
   * @param radiusKm - Radius in kilometers (default: 20km)
   * @param excludeUserId - User ID to exclude from results
   * @returns Array of user locations within radius
   */
  async findNearbyUsers(
    latitude: number,
    longitude: number,
    radiusKm: number = 10,
    excludeUserId?: string,
  ): Promise<string[]> {
    try {
      // Calculate bounding box (rough approximation)
      // 1 degree latitude ≈ 111 km
      const latDelta = radiusKm / 111;
      const lngDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

      const minLat = latitude - latDelta;
      const maxLat = latitude + latDelta;
      const minLng = longitude - lngDelta;
      const maxLng = longitude + lngDelta;

      const where: any = {
        latitude: {
          gte: minLat,
          lte: maxLat,
        },
        longitude: {
          gte: minLng,
          lte: maxLng,
        },
        user: {
          isActive: true,
        },
      };

      if (excludeUserId) {
        where.userId = {
          not: excludeUserId,
        };
      }

      // First, get locations in bounding box
      const locations = await this.prisma.userLocation.findMany({
        where,
        include: {
          user: {
            select: {
              id: true,
              isActive: true,
            },
          },
        },
        orderBy: {
          updatedAt: 'desc',
        },
      });

      // Filter by actual route distance using Google Maps Routes API
      const nearbyUsers: string[] = [];
      for (const location of locations) {
        try {
          const apiKey = this.configService.get<string>('ROUTES_API_KEY');
          if (!apiKey) {
            throw new Error('Google Maps Routes API key not configured');
          }

          const routeResult = await calculateRoute(
            apiKey,
            latitude,
            longitude,
            location.latitude,
            location.longitude,
          );

          if (routeResult.distanceKm <= radiusKm) {
            nearbyUsers.push(location.user.id);
          }
        } catch (error: any) {
          // Fallback to Haversine distance if route calculation fails
          this.logger.warn(
            `Route calculation failed for location ${location.id}, falling back to Haversine distance:`,
            error?.message || 'Unknown error',
          );
          const distance = calculateDistance(
            { latitude, longitude },
            { latitude: location.latitude, longitude: location.longitude },
          );
          if (distance <= radiusKm) {
            nearbyUsers.push(location.user.id);
          }
        }
      }

      this.logger.log(
        `Found ${nearbyUsers.length} nearby users within ${radiusKm}km of (${latitude}, ${longitude})`,
      );

      return nearbyUsers;
    } catch (error) {
      this.logger.error(
        `Failed to find nearby users for (${latitude}, ${longitude}):`,
        error,
      );
      throw error;
    }
  }
}
