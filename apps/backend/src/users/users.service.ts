import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { User } from './models/user.model';
import { UserDto } from './dto/user.dto';
import { UserFollowing } from '../user-followings/models/user-following.model';

@Injectable()
export class UsersService {
  constructor(private prisma: PrismaService) {}

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
    const users = (await this.prisma.user.findMany({
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        avatar: true,
        isActive: true,
      },
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
    })) as unknown as User[];

    // Get all users that the current user is following
    const userFollowings = (await this.prisma.userFollowing.findMany({
      where: {
        followerId: currentUserId,
        followingId: {
          in: users.map((user) => user.id),
        },
      },
    })) as unknown as UserFollowing[];

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

  async findOne(id: string): Promise<UserDto> {
    const user = (await this.prisma.user.findUnique({
      where: { id },
    })) as unknown as User;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return {
      ...user,
      firstName: user.firstName || null,
      lastName: user.lastName || null,
      avatar: user.avatar || null,
    };
  }

  async userProfile(userId: string, currentUserId: string): Promise<UserDto> {
    const user = (await this.prisma.user.findUnique({
      where: { id: userId },
    })) as unknown as User;

    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Check if current user is following the requested user
    const isFollowing = (await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userId,
        },
      },
    })) as unknown as UserFollowing;

    // Count followers
    const followerCount = (await this.prisma.userFollowing.count({
      where: {
        followingId: userId,
      },
    })) as unknown as number;

    // Count following
    const followingCount = (await this.prisma.userFollowing.count({
      where: {
        followerId: userId,
      },
    })) as unknown as number;

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
}
