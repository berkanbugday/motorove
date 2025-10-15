import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { UserFollowing } from './models/user-following.model';
import { UserFollowingDto } from './dto/user-following.dto';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { StorageService } from '../core/storage/storage.service';
import { Logger } from '@nestjs/common';

@Injectable()
export class UserFollowingsService {
  private readonly logger = new Logger(UserFollowingsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // Get users that follow the given userId with pagination
  async findFollowerUsers(
    userId: string,
    limit?: number,
    skip?: number,
    authToken?: string,
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

    const usersWithSignedUrls = await Promise.all(
      followers.map(async (follower) => ({
        ...follower,
        follower: {
          ...follower.follower,
          avatar: follower.follower.avatar
            ? await this.storageService.getSignedUrl(
                follower.follower.avatar,
                3600,
                authToken,
              )
            : follower.follower.avatar,
        },
      })),
    );

    return await Promise.all(
      usersWithSignedUrls.map((f) => this.mapToDto(f as UserFollowing)),
    );
  }

  // Get users that the given userId is following with pagination
  async findFollowingUsers(
    userId: string,
    limit?: number,
    skip?: number,
    authToken?: string,
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

    const usersWithSignedUrls = await Promise.all(
      followings.map(async (following) => ({
        ...following,
        following: {
          ...following.following,
          avatar: following.following.avatar
            ? await this.storageService.getSignedUrl(
                following.following.avatar,
                3600,
                authToken,
              )
            : following.following.avatar,
        },
      })),
    );

    return await Promise.all(
      usersWithSignedUrls.map((f) => this.mapToDto(f as UserFollowing)),
    );
  }

  async findFollowRequests(
    userId: string,
    limit?: number,
    skip?: number,
    authToken?: string,
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

    const usersWithSignedUrls = await Promise.all(
      followRequests.map(async (followRequest) => ({
        ...followRequest,
        follower: {
          ...followRequest.follower,
          avatar: followRequest.follower.avatar
            ? await this.storageService.getSignedUrl(
                followRequest.follower.avatar,
                3600,
                authToken,
              )
            : followRequest.follower.avatar,
        },
      })),
    );

    return await Promise.all(
      usersWithSignedUrls.map((f) => this.mapToDto(f as UserFollowing)),
    );
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
      throw new NotFoundException('User not found');
    }

    // Prevent self-following
    if (followerUser === followingUser) {
      throw new ConflictException('Cannot follow yourself');
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
      throw new ConflictException('Already following this user');
    }

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
        status: followingUser.userSetting?.autoAcceptFollowers
          ? ApprovalStatus.ACCEPTED
          : ApprovalStatus.PENDING,
      },
      update: {
        status: followingUser.userSetting?.autoAcceptFollowers
          ? ApprovalStatus.ACCEPTED
          : ApprovalStatus.PENDING,
        isActive: true,
        updatedAt: new Date(),
      },
      select: {
        status: true,
      },
    });

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
      throw new NotFoundException('Not following this user');
    }

    // Delete the follow relationship
    await this.prisma.userFollowing.update({
      where: {
        id: userFollowing.id,
      },
      data: {
        isActive: false,
        updatedAt: new Date(),
      },
    });

    return ApprovalStatus.REJECTED;
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
      });

      if (!userFollowing) {
        throw new NotFoundException(`User following with ID ${id} not found`);
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

      // Send notification to the user
      // await this.notificationsService.create(
      //   {
      //     userId,
      //     title: 'Membership status updated',
      //     body: `Your membership status in ${updatedMembership.group.name} has been updated to ${newStatus}`,
      //     type: NotificationType.GROUP_MEMBERSHIP_STATUS_UPDATED,
      //     channel: NotificationChannel.PUSH,
      //     data: JSON.stringify({
      //       groupId: updatedMembership.group.id,
      //       groupName: updatedMembership.group.name,
      //       status: newStatus,
      //     }),
      //   },
      //   userId,
      // );

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
