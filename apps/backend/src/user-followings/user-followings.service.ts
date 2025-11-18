import { Injectable } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { UserFollowing } from './models/user-following.model';
import { UserFollowingDto } from './dto/user-following.dto';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { StorageService } from '../core/storage/storage.service';
import { Logger } from '@nestjs/common';
import { QueueService } from '../core/queue/queue.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '@motorove/shared';

@Injectable()
export class UserFollowingsService {
  private readonly logger = new Logger(UserFollowingsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private queueService: QueueService,
  ) {}

  // Get users that follow the given userId with pagination
  async findFollowerUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const followers = await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
        isActive: true,
        status: {
          in: [ApprovalStatus.ACCEPTED],
        },
      },
      include: {
        follower: {
          include: {
            city: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });

    return followers.map((f) => this.mapToDto(f as UserFollowing));
  }

  // Get users that the given userId is following with pagination
  async findFollowingUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const followings = await this.prisma.userFollowing.findMany({
      where: {
        followerId: userId,
        isActive: true,
        status: {
          in: [ApprovalStatus.ACCEPTED],
        },
      },
      include: {
        following: {
          include: {
            city: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });

    return followings.map((f) => this.mapToDto(f as UserFollowing));
  }

  async findFollowRequests(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const followRequests = await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
        isActive: true,
        status: ApprovalStatus.PENDING,
      },
      include: {
        follower: {
          include: {
            city: true,
          },
        },
      },
      take: limit,
      skip: skip,
    });

    return followRequests.map((f) => this.mapToDto(f as UserFollowing));
  }

  async follow(
    followerId: string,
    followingId: string,
  ): Promise<ApprovalStatus> {
    // Check if users exist
    const [followerUser, followingUser] = await Promise.all([
      await this.prisma.user.findFirst({ where: { id: followerId } }),
      await this.prisma.user.findFirst({
        where: { id: followingId },
        include: { userSetting: true },
      }),
    ]);

    if (!followerUser || !followingUser) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'user',
      });
    }

    // Prevent self-following
    if (followerUser === followingUser) {
      ExceptionHelper.conflict('errors.common.cannot_follow_yourself');
    }

    // Check if already following
    const existingFollow = await this.prisma.userFollowing.findFirst({
      where: {
        followerId: followerId,
        followingId: followingId,
        isActive: true,
        status: {
          in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
        },
      },
    });

    if (existingFollow) {
      ExceptionHelper.conflict('errors.common.already_following');
    }

    // Determine if auto-accept is enabled
    const autoAccept = followingUser.userSetting?.autoAcceptFollowers || false;
    const followStatus = autoAccept
      ? ApprovalStatus.ACCEPTED
      : ApprovalStatus.PENDING;

    // Create follow relationship
    const follow = await this.prisma.userFollowing.upsert({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
      },
      create: {
        followerId: followerId,
        followingId: followingId,
        status: followStatus,
      },
      update: {
        status: followStatus,
        isActive: true,
        updatedAt: new Date(),
      },
      select: {
        status: true,
      },
    });

    // Send notification based on auto-accept setting
    try {
      const followerName = `${followerUser.firstName} ${followerUser.lastName}`;

      if (autoAccept) {
        // Send NEW_FOLLOWER notification when auto-accepted
        await this.queueService.addNotificationJob(
          {
            userId: followingId,
            title: 'user.new_follower.title',
            body: 'user.new_follower.body',
            type: NotificationType.NEW_FOLLOWER,
            channel: NotificationChannel.PUSH,
            data: {
              followerId: followerId,
              userFullName: followerName,
            } as Record<string, any>,
          },
          followerId,
        );
      } else {
        // Send USER_FOLLOW_REQUEST notification when pending approval
        await this.queueService.addNotificationJob(
          {
            userId: followingId,
            title: 'user.follow_request.title',
            body: 'user.follow_request.body',
            type: NotificationType.USER_FOLLOW_REQUEST,
            channel: NotificationChannel.PUSH,
            data: {
              followerId: followerId,
              userFullName: followerName,
            } as Record<string, any>,
          },
          followerId,
        );
      }
    } catch (error) {
      this.logger.error('Failed to send follow notification', error);
    }

    return follow.status as ApprovalStatus;
  }

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<ApprovalStatus> {
    // Check if relationship exists
    const userFollowing = await this.prisma.userFollowing.findFirst({
      where: {
        followerId: followerId,
        followingId: followingId,
        isActive: true,
        status: {
          in: [ApprovalStatus.PENDING, ApprovalStatus.ACCEPTED],
        },
      },
    });

    if (!userFollowing) {
      ExceptionHelper.notFound('errors.common.not_following');
    }

    // Delete the follow relationship
    const unfollow = await this.prisma.userFollowing.update({
      where: {
        id: userFollowing.id,
      },
      data: {
        isActive: false,
        status: ApprovalStatus.REJECTED,
        updatedAt: new Date(),
      },
    });

    return unfollow.status as ApprovalStatus;
  }

  async updateApprovalStatus(
    id: string,
    newStatus: ApprovalStatus,
  ): Promise<UserFollowingDto> {
    try {
      // Check if the group exists
      const userFollowing = await this.prisma.userFollowing.findFirst({
        where: {
          id,
          isActive: true,
          status: ApprovalStatus.PENDING,
        },
        include: {
          follower: true,
          following: true,
        },
      });

      if (!userFollowing) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'user_following',
          id,
        });
      }

      // Update the membership status
      const updatedUserFollowing = await this.prisma.userFollowing.update({
        where: {
          id,
        },
        data: {
          status: newStatus,
          updatedAt: new Date(),
        },
      });

      // Send notification if the request was accepted
      if (newStatus === ApprovalStatus.ACCEPTED) {
        try {
          const followingName = `${userFollowing.following.firstName} ${userFollowing.following.lastName}`;

          await this.queueService.addNotificationJob(
            {
              userId: userFollowing.followerId,
              title: 'user.follow_request_accepted.title',
              body: 'user.follow_request_accepted.body',
              type: NotificationType.USER_FOLLOW_REQUEST_ACCEPTED,
              channel: NotificationChannel.PUSH,
              data: {
                followingId: userFollowing.followingId,
                userFullName: followingName,
              } as Record<string, any>,
            },
            userFollowing.followingId,
          );
        } catch (error) {
          this.logger.error(
            'Failed to send follow request accepted notification',
            error,
          );
        }
      }

      return this.mapToDto(updatedUserFollowing as UserFollowing);
    } catch (error) {
      this.logger.error(`Failed to update member status`, error);
      throw error;
    }
  }

  private mapToDto(follow: UserFollowing): UserFollowingDto {
    return {
      id: follow.id,
      follower: follow.follower as UserDto,
      following: follow.following as UserDto,
      createdAt: follow.createdAt,
      updatedAt: follow.updatedAt,
      status: follow.status,
    };
  }
}
