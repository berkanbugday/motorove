import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from './dto/user.dto';
import { ProfileDto } from './dto/profile.dto';
import { AccountSetupInput } from './dto/account-setup.input';
import { UpdateUserProfileInput } from './dto/update-user-profile.input';
import { StorageService } from '../core/storage/storage.service';
import { CityDto } from '../cities/dto/city.dto';
import { plainToClass } from 'class-transformer';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { Interest } from '../enums/models/interest.enum';
import { RidingStyle } from '../enums/models/riding-style.enum';
import { UserStatsDto } from './dto/user-stats.dto';
import { UserSocialMediaProfileDto } from './dto/user-social-media-profile.dto';
import { EventParticipantStatus } from '../enums/models/event-participant-status.enum';
import { EventStatus } from '../enums/models/event-status.enum';
import { Gender } from '../enums/models/gender.enum';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private profanityFilterService: ProfanityFilterService,
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

  async userProfile(
    userId: string,
    authToken?: string,
    currentUserId?: string,
  ): Promise<ProfileDto> {
    const user = await this.prisma.user.findFirst({
      where: { id: userId },
      include: {
        city: true,
        socialMediaProfiles: true,
        following: {
          where: {
            followerId: currentUserId,
            isActive: true,
          },
          select: {
            status: true,
          },
        },
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Get signed URL for avatar if exists
    if (user.avatar && authToken) {
      try {
        user.avatar = await this.storageService.getSignedUrl(
          user.avatar,
          3600,
          authToken,
        );
      } catch (error) {
        this.logger.error(
          `Error getting signed URL for avatar: ${error.message}`,
        );
      }
    }

    user.bio = this.profanityFilterService.filterText(user.bio!);

    // Get following status if currentUserId is provided
    const followingStatus =
      currentUserId && user.following.length > 0
        ? user.following[0].status
        : undefined;

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      avatar: user.avatar || undefined,
      gender: (user.gender as Gender) || undefined,
      dateOfBirth: user.dateOfBirth || undefined,
      city: user.city as CityDto,
      bio: user.bio || undefined,
      ridingStyles: user.ridingStyles as RidingStyle[],
      interests: user.interests as Interest[],
      socialMediaProfiles:
        user.socialMediaProfiles as UserSocialMediaProfileDto[],
      followingStatus: followingStatus as ApprovalStatus,
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

  async getUserStats(userId: string): Promise<UserStatsDto> {
    try {
      // Get posts count
      const postsCount = await this.prisma.post.count({
        where: {
          createdById: userId,
          isActive: true,
        },
      });

      // Get events count (events user is a participant in)
      const eventsCount = await this.prisma.eventParticipant.count({
        where: {
          createdById: userId,
          status: EventParticipantStatus.JOINED,
          isActive: true,
          event: {
            isActive: true,
            status: { not: EventStatus.DRAFT },
          },
        },
      });

      // Get followers count (users following this user)
      const followersCount = await this.prisma.userFollowing.count({
        where: {
          followingId: userId,
          isActive: true,
          status: ApprovalStatus.ACCEPTED,
        },
      });

      // Get following count (users this user is following)
      const followingCount = await this.prisma.userFollowing.count({
        where: {
          followerId: userId,
          isActive: true,
          status: ApprovalStatus.ACCEPTED,
        },
      });

      return {
        postsCount,
        eventsCount,
        followersCount,
        followingCount,
      };
    } catch (error) {
      this.logger.error(`Failed to get user stats for user ${userId}`, error);
      throw error;
    }
  }

  async updateUserProfile(
    input: UpdateUserProfileInput,
    userId: string,
    authToken?: string,
  ): Promise<ProfileDto> {
    try {
      // Process avatar if present and is base64

      let avatarUrl: string | undefined;
      if (input.avatar?.includes('base64')) {
        avatarUrl = await this.storageService.processImageUpload(
          input.avatar,
          'users/avatars',
          `avatar-${userId}`,
          authToken,
        );
      } else {
        delete input.avatar;
      }

      const userResult = await this.prisma.user.update({
        where: { id: userId },
        data: {
          ...(input.firstName && { firstName: input.firstName }),
          ...(input.lastName && { lastName: input.lastName }),
          ...(input.bio !== undefined && { bio: input.bio }),
          ...(avatarUrl && { avatar: avatarUrl }),
          ...(input.dateOfBirth && { dateOfBirth: input.dateOfBirth }),
          ...(input.gender && { gender: input.gender }),
          ...(input.cityId && { city: { connect: { id: input.cityId } } }),
          ...(input.ridingStyles && { ridingStyles: input.ridingStyles }),
          ...(input.interests && { interests: input.interests }),
          ...(input.socialMediaProfiles && {
            socialMediaProfiles: {
              deleteMany: { createdById: userId },
              createMany: {
                data: input.socialMediaProfiles.map((sm) => ({
                  platform: sm.platform,
                  username: sm.username,
                })),
              },
            },
          }),
          updatedAt: new Date(),
        },
        include: {
          city: true,
          socialMediaProfiles: true,
        },
      });

      if (!userResult) {
        throw new NotFoundException('User not found');
      }

      // Get signed URL for avatar if exists
      let finalAvatar = userResult.avatar;
      if (finalAvatar && authToken) {
        try {
          finalAvatar = await this.storageService.getSignedUrl(
            finalAvatar,
            3600,
            authToken,
          );
        } catch (error) {
          this.logger.error(
            `Error getting signed URL for avatar: ${error.message}`,
          );
        }
      }

      userResult.bio = this.profanityFilterService.filterText(userResult.bio!);

      return {
        id: userResult.id,
        firstName: userResult.firstName,
        lastName: userResult.lastName,
        email: userResult.email,
        avatar: finalAvatar || undefined,
        city: (userResult.city as CityDto) || undefined,
        bio: userResult.bio || undefined,
        ridingStyles: userResult.ridingStyles as RidingStyle[],
        interests: userResult.interests as Interest[],
        socialMediaProfiles:
          userResult.socialMediaProfiles as UserSocialMediaProfileDto[],
      };
    } catch (error) {
      this.logger.error(`Failed to update user profile`, error);
      throw error;
    }
  }
}
