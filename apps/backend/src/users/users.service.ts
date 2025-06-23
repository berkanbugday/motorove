import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './models/user.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

  async findOne(id: string): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });

    if (!user) return null;

    return {
      ...user,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      avatar: user.avatar || null,
    };
  }

  async getUserProfile(
    userId: string,
    currentUserId: string,
  ): Promise<User | null> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) return null;

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
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      avatar: user.avatar || null,
      isFollowing: !!isFollowing,
      followerCount,
      followingCount,
    };
  }

  async searchUsers(
    query: string,
    currentUserId: string,
    limit = 10,
    skip = 0,
  ): Promise<User[]> {
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
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      avatar: user.avatar || null,
      isFollowing: followingIdsSet.has(user.id),
    }));
  }

  async findByIds(ids: string[]): Promise<User[]> {
    if (!ids.length) return [];

    const users = await this.prisma.user.findMany({
      where: {
        id: { in: ids },
        isActive: true,
      },
    });

    return users.map((user) => ({
      ...user,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      avatar: user.avatar || null,
    }));
  }
}
