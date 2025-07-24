import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { AccountSetupInput } from './dto/account-setup.input';
import { StorageService } from '../core/storage/storage.service';
import { CityDto } from '../cities/dto/city.dto';

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
  ): Promise<UserDto[]> {
    const searchQuery = query?.trim();

    // If no search query, return empty array
    if (!searchQuery) {
      return [];
    }

    // Search for users by first or last name
    const users = await this.prisma.user.findMany({
      where: {
        OR: [
          { firstName: { contains: searchQuery, mode: 'insensitive' } },
          { lastName: { contains: searchQuery, mode: 'insensitive' } },
          { email: { contains: searchQuery, mode: 'insensitive' } },
        ],
        // Don't include the current user in search results
        id: { not: currentUserId },
        // Only include active users
        isActive: true,
      },
      take: limit,
      skip: skip,
      orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
      include: {
        city: true,
      },
    });

    // Get all users that the current user is following
    const userFollowings = await this.prisma.userFollowing.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: users.map((user) => user.id),
        },
      },
    });

    // Create a set of following IDs for efficient lookup
    const followingIdsSet = new Set(userFollowings.map((uf) => uf.followingId));

    return users.map((user) => ({
      ...user,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || undefined,
      isFollowing: followingIdsSet.has(user.id),
      city: user.city as CityDto,
    }));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
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
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || undefined,
      city: user.city as CityDto,
    };
  }

  async userProfile(userId: string, currentUserId: string): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        city: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user is following the requested user
    const isFollowing = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    });

    // Count followers
    const followerCount = await this.prisma.userFollowing.count({
      where: {
        followingId: userId,
      },
    });

    // Count following
    const followingCount = await this.prisma.userFollowing.count({
      where: {
        followerId: userId,
      },
    });

    return {
      ...user,
      firstName: user.firstName,
      lastName: user.lastName,
      avatar: user.avatar || undefined,
      isFollowing: !!isFollowing,
      followerCount,
      followingCount,
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

  async updateNotificationPermission(
    userId: string,
    notificationPermission: any,
  ): Promise<boolean> {
    try {
      const user = await this.prisma.user.update({
        where: { id: userId },
        data: {
          notificationPermission,
          updatedAt: new Date(),
        },
      });
      return !!user;
    } catch (error) {
      this.logger.error(`Failed to update notification permission`, error);
      throw error;
    }
  }
}
