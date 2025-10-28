import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { AccountSetupInput } from './dto/account-setup.input';
import { StorageService } from '../core/storage/storage.service';
import { CityDto } from '../cities/dto/city.dto';
import { plainToClass } from 'class-transformer';
import { ApprovalStatus } from '@motorove/shared';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll(
    query?: string,
    limit?: number,
    skip?: number,
    currentUserId?: string,
    authToken?: string,
  ): Promise<UserDto[]> {
    const searchQuery = query?.trim();

    // Get current user's city information
    let currentUserCityId: string | null = null;
    if (currentUserId && !searchQuery) {
      const currentUser = await this.prisma.user.findUnique({
        where: { id: currentUserId },
        select: { cityId: true },
      });
      currentUserCityId = currentUser?.cityId || null;
    }

    // Get users that current user is already following (only ACCEPTED)
    // Only exclude them when no search query (for default list)
    const followingUserIds =
      currentUserId && !searchQuery
        ? await this.prisma.userFollowing
            .findMany({
              where: {
                followerId: currentUserId,
                isActive: true,
                status: {
                  in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
                },
              },
              select: { followingId: true },
            })
            .then((followings) => followings.map((f) => f.followingId))
        : [];

    // Build base filters that always apply
    const baseFilters: any = {
      // Don't include the current user in results
      id:
        followingUserIds.length > 0
          ? { not: { in: [currentUserId, ...followingUserIds] } }
          : { not: currentUserId },
      // Only include active users
      isActive: true,
      // Filter by same city if current user has a city
      ...(currentUserCityId && { cityId: currentUserCityId }),
    };

    // Build where clause with proper AND/OR structure
    const whereClause: any = {
      AND: [
        baseFilters,
        // Add search conditions if query is provided
        ...(searchQuery
          ? [
              {
                OR: [
                  { firstName: { contains: searchQuery, mode: 'insensitive' } },
                  { lastName: { contains: searchQuery, mode: 'insensitive' } },
                ],
              },
            ]
          : []),
      ],
    };

    // Search for users
    const users = await this.prisma.user.findMany({
      where: whereClause,
      take: limit,
      skip: skip,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        city: true,
        followers: {
          where: {
            isActive: true,
            status: {
              in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
            },
          },
        },
        following: {
          where: {
            isActive: true,
            status: {
              in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
            },
          },
        },
      },
    });

    const usersWithSignedUrls = await Promise.all(
      users.map(async (user) => ({
        ...user,
        city: user.city as CityDto,
        followingStatus: user.following.find(
          (f) => f.followerId === currentUserId,
        )?.status,
        avatar: user.avatar
          ? await this.storageService.getSignedUrl(user.avatar, 3600, authToken)
          : user.avatar,
      })),
    );

    return usersWithSignedUrls.map((user) => plainToClass(UserDto, user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        city: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      avatar: user.avatar || undefined,
      city: user.city as CityDto,
    };
  }

  async userProfile(userId: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        city: true,
        followers: {
          where: {
            isActive: true,
            status: {
              in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
            },
          },
        },
        following: {
          where: {
            isActive: true,
            status: {
              in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
            },
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || undefined,
      city: user.city as CityDto,
    };
  }

  async accountSetup(
    input: AccountSetupInput,
    userId: string,
    authToken?: string,
  ): Promise<boolean> {
    try {
      // Process avatar if present and is base64
      const avatarUrl = await this.storageService.processImageUpload(
        input.avatar,
        'users/avatars',
        `avatar-${userId}`,
        authToken,
      );

      // Prepare update data
      const accountSetupData: any = {
        city: { connect: { id: input.cityId } },
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        ridingStyles: input.ridingStyles,
        interests: input.interests,
        avatar: avatarUrl,
        hasCompletedSetup: true,
        updatedAt: new Date(),
      };

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: accountSetupData,
      });

      if (!user) {
        throw new NotFoundException('User not found');
      }

      return user.hasCompletedSetup;
    } catch (error) {
      this.logger.error(`Failed to account setup`, error);
      throw error;
    }
  }
}
