import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { UserFollowing } from './models/user-following.model';
import { UserFollowingDto } from './dto/user-following.dto';
import { InvitationStatus } from '../enums/models/invitation-status.enum';

@Injectable()
export class UserFollowingsService {
  constructor(private prisma: PrismaService) {}

  // Get users that follow the given userId with pagination
  async findFollowerUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const followers = await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: true,
      },
      take: limit,
      skip: skip,
    });

    return await Promise.all(
      followers.map((f) => this.mapToDto(f as unknown as UserFollowing)),
    );
  }

  // Get users that the given userId is following with pagination
  async findFollowingUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const following = await this.prisma.userFollowing.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true,
      },
      take: limit,
      skip: skip,
    });

    return await Promise.all(
      following.map((f) => this.mapToDto(f as unknown as UserFollowing)),
    );
  }

  async follow(
    followerId: string,
    followingId: string,
  ): Promise<InvitationStatus> {
    // Check if users exist
    const [followerUser, followingUser] = await Promise.all([
      await this.prisma.user.findUnique({ where: { id: followerId } }),
      await this.prisma.user.findUnique({
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
    const existingFollow = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
        isActive: true,
        status: {
          in: [InvitationStatus.PENDING, InvitationStatus.ACCEPTED],
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
          ? InvitationStatus.ACCEPTED
          : InvitationStatus.PENDING,
      },
      update: {
        status: followingUser.userSetting?.autoAcceptFollowers
          ? InvitationStatus.ACCEPTED
          : InvitationStatus.PENDING,
        isActive: true,
        updatedAt: new Date(),
      },
      select: {
        status: true,
      },
    });

    return follow.status as InvitationStatus;
  }

  async unfollow(
    followerId: string,
    followingId: string,
  ): Promise<InvitationStatus> {
    // Check if relationship exists
    const userFollowing = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: followerId,
          followingId: followingId,
        },
        isActive: true,
        status: {
          in: [InvitationStatus.PENDING, InvitationStatus.ACCEPTED],
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

    return InvitationStatus.REJECTED;
  }

  private mapToDto(follow: UserFollowing): UserFollowingDto {
    return {
      id: follow.id,
      follower: follow.follower as UserDto,
      following: follow.following as UserDto,
      createdAt: follow.createdAt,
    };
  }
}
