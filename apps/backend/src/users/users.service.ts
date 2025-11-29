import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
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
import { ConfigService } from '@nestjs/config';
import { UserBlocksService } from '../user-blocks/user-blocks.service';
import { SupabaseService } from '../auth/supabase.service';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';

@Injectable()
export class UsersService {
  private readonly logger = new Logger(UsersService.name);
  private readonly imagePublicUrl: string;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private profanityFilterService: ProfanityFilterService,
    private configService: ConfigService,
    private userBlocksService: UserBlocksService,
    private supabaseService: SupabaseService,
  ) {
    this.imagePublicUrl = `${this.configService.get<string>('IMAGE_PUBLIC_URL')}`;
  }

  async findAll(
    query?: string,
    limit?: number,
    skip?: number,
    currentUserId?: string,
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

    // Get blocked user IDs if currentUserId is provided
    const blockedUserIds = currentUserId
      ? await this.userBlocksService.getBlockedUserIds(currentUserId)
      : [];

    // Combine excluded user IDs (current user, following users, and blocked users)
    const excludedUserIds = [
      ...(currentUserId ? [currentUserId] : []),
      ...followingUserIds,
      ...blockedUserIds,
    ];

    // Build base filters that always apply
    const baseFilters: any = {
      // Don't include the current user, following users, or blocked users in results
      ...(excludedUserIds.length > 0 && {
        id: { notIn: excludedUserIds },
      }),
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

    return users.map((user) => plainToClass(UserDto, user));
  }

  async findOne(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id },
      include: {
        city: true,
        userSetting: true,
      },
    });

    if (!user) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'user',
      });
    }

    return plainToClass(UserDto, user);
  }

  async findMe(id: string): Promise<UserDto> {
    const user = await this.prisma.user.findFirst({
      where: { id },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        hasCompletedSetup: true,
        supabaseId: true,
        userSetting: {
          select: {
            notificationPermission: true,
            preferredLanguage: true,
          },
        },
      },
    });

    if (!user) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'user',
      });
    }

    return plainToClass(UserDto, user);
  }

  async userProfile(
    userId: string,
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
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'user',
      });
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
      let avatarUrl: string | undefined;
      if (input.avatar?.includes('base64')) {
        // Process avatar if present and is base64
        avatarUrl = await this.storageService.processImageUpload(
          input.avatar,
          'users/avatars',
          `avatar-${userId}`,
          authToken,
        );
      }

      // Prepare update data
      const accountSetupData: any = {
        city: { connect: { id: input.cityId } },
        dateOfBirth: input.dateOfBirth,
        gender: input.gender,
        ridingStyles: input.ridingStyles,
        interests: input.interests,
        ...(avatarUrl && { avatar: `${this.imagePublicUrl}/${avatarUrl}` }),
        hasCompletedSetup: true,
        updatedAt: new Date(),
      };

      const user = await this.prisma.user.update({
        where: { id: userId },
        data: accountSetupData,
      });

      if (!user) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user',
        });
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
          ...(avatarUrl && { avatar: `${this.imagePublicUrl}/${avatarUrl}` }),
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
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user',
        });
      }

      userResult.bio = this.profanityFilterService.filterText(userResult.bio!);

      return {
        id: userResult.id,
        firstName: userResult.firstName,
        lastName: userResult.lastName,
        email: userResult.email,
        avatar: userResult.avatar || undefined,
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

  async deleteAccount(userId: string): Promise<boolean> {
    try {
      // Get user with supabaseId
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, supabaseId: true, email: true },
      });

      if (!user) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user',
        });
      }

      // Delete user from Supabase after database operations succeed
      const { error: supabaseError } = await this.supabaseService.deleteUser(
        user.supabaseId,
      );

      if (supabaseError) {
        this.logger.error(
          `Failed to delete Supabase user ${user.supabaseId}:`,
          supabaseError,
        );
        // Don't throw here - database is already updated, log the error
        // The account is effectively deleted from our system
      }

      // Use transaction to ensure all operations succeed or fail together
      await this.prisma.$transaction(async (tx) => {
        // Deactivate user-generated content (posts, comments, etc.)
        // Set isActive to false for all user-related data
        await tx.post.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        await tx.postComment.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Delete user's post likes and saves (no isActive field)
        await tx.postLike.deleteMany({
          where: { userId: userId },
        });

        await tx.postSave.deleteMany({
          where: { userId: userId },
        });

        await tx.businessComment.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's events (draft events can be removed, others should be cancelled)
        await tx.event.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's emergencies
        await tx.emergency.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's warnings
        await tx.warning.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Find all groups created by the user
        const userCreatedGroups = await tx.group.findMany({
          where: {
            createdById: userId,
            isActive: true,
          },
          include: {
            memberships: {
              where: {
                isActive: true,
                role: GroupMemberRole.ADMIN,
              },
            },
          },
        });

        // Delete groups where the user is the only admin
        for (const group of userCreatedGroups) {
          // Check if there are any other active admins besides the user being deleted
          const otherAdmins = group.memberships.filter(
            (membership) => membership.userId !== userId,
          );

          if (otherAdmins.length === 0) {
            // No other admins exist, delete/deactivate the group
            await tx.group.update({
              where: { id: group.id },
              data: {
                isActive: false,
                updatedAt: new Date(),
              },
            });

            this.logger.log(
              `Deleted group ${group.id} (${group.name}) as user ${userId} was the only admin`,
            );
          }
        }

        // Deactivate user's group memberships
        await tx.groupMembership.updateMany({
          where: { userId: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's follow relationships
        await tx.userFollowing.updateMany({
          where: {
            OR: [{ followerId: userId }, { followingId: userId }],
          },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's blocks
        await tx.userBlock.updateMany({
          where: {
            OR: [{ blockerId: userId }, { blockedId: userId }],
          },
          data: { isActive: false },
        });

        // Deactivate notifications
        await tx.notification.updateMany({
          where: { userId: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate device tokens
        await tx.deviceToken.updateMany({
          where: { userId: userId },
          data: { isActive: false },
        });

        // Deactivate user's event participations
        await tx.eventParticipant.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's event invitations
        await tx.eventInvitation.updateMany({
          where: {
            OR: [{ createdById: userId }, { inviteeId: userId }],
          },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Delete user's social media profiles (no isActive field)
        await tx.userSocialMediaProfile.deleteMany({
          where: { createdById: userId },
        });

        // Deactivate user's motorcycles and equipment
        await tx.motorcycle.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        await tx.equipment.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Delete user's locations (no isActive field, cascade delete will handle)
        await tx.userLocation.deleteMany({
          where: { userId: userId },
        });

        // Delete user's settings (no isActive field, one-to-one relationship)
        await tx.userSetting.deleteMany({
          where: { userId: userId },
        });

        // Deactivate user's support requests
        await tx.supportRequest.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Deactivate user's content reports
        await tx.contentReport.updateMany({
          where: { createdById: userId },
          data: { isActive: false, updatedAt: new Date() },
        });

        // Finally, deactivate the user account
        await tx.user.update({
          where: { id: userId },
          data: {
            isActive: false,
            email: `deleted_${Date.now()}_${userId}_${user.email}`, // Anonymize email
            updatedAt: new Date(),
          },
        });
      });

      this.logger.log(`Account deleted successfully for user ${userId}`);
      return true;
    } catch (error) {
      this.logger.error(`Failed to delete account for user ${userId}`, error);
      throw error;
    }
  }
}
