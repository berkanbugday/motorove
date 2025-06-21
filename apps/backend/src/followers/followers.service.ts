import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class FollowersService {
  constructor(private prisma: PrismaService) {}

  async followUser(currentUserId: string, userIdToFollow: string) {
    // Check if users exist
    const [currentUser, userToFollow] = await Promise.all([
      this.prisma.user.findUnique({ where: { id: currentUserId } }),
      this.prisma.user.findUnique({ where: { id: userIdToFollow } }),
    ]);

    if (!currentUser || !userToFollow) {
      throw new NotFoundException('User not found');
    }

    // Prevent self-following
    if (currentUserId === userIdToFollow) {
      throw new ConflictException('Cannot follow yourself');
    }

    // Check if already following
    const existingFollow = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToFollow,
        },
      },
    });

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship
    return this.prisma.userFollowing.create({
      data: {
        followerId: currentUserId,
        followingId: userIdToFollow,
      },
      include: {
        follower: true,
        following: true,
      },
    });
  }

  async unfollowUser(currentUserId: string, userIdToUnfollow: string) {
    // Check if relationship exists
    const followingRelation = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToUnfollow,
        },
      },
    });

    if (!followingRelation) {
      throw new NotFoundException('Not following this user');
    }

    // Delete the follow relationship
    return this.prisma.userFollowing.delete({
      where: {
        id: followingRelation.id,
      },
    });
  }

  // Get users that follow the given userId
  async getFollowers(userId: string) {
    const followers = await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: true,
      },
    });

    return followers;
  }

  // Get users that the given userId is following
  async getFollowing(userId: string) {
    const following = await this.prisma.userFollowing.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true,
      },
    });

    return following;
  }

  async getUserFollowers(userId: string) {
    const followers = await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: true,
      },
    });

    return followers.map((f) => f.follower);
  }

  async getUserFollowing(userId: string) {
    const following = await this.prisma.userFollowing.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true,
      },
    });

    return following.map((f) => f.following);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    });

    return !!follow;
  }
}
