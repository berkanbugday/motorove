import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UserDto } from 'src/users/dto/user.dto';
import { UserFollowing } from './models/user-following.model';
import { UserFollowingDto } from './dto/user-following.dto';

@Injectable()
export class UserFollowingsService {
  constructor(private prisma: PrismaService) {}

  // Get users that follow the given userId with pagination
  async findFollowerUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const followers = (await this.prisma.userFollowing.findMany({
      where: {
        followingId: userId,
      },
      include: {
        follower: true,
      },
      take: limit,
      skip: skip,
    })) as unknown as UserFollowing[];

    return await Promise.all(followers.map((f) => this.mapToDto(f)));
  }

  // Get users that the given userId is following with pagination
  async findFollowingUsers(
    userId: string,
    limit?: number,
    skip?: number,
  ): Promise<UserFollowingDto[]> {
    const following = (await this.prisma.userFollowing.findMany({
      where: {
        followerId: userId,
      },
      include: {
        following: true,
      },
      take: limit,
      skip: skip,
    })) as unknown as UserFollowing[];

    return await Promise.all(following.map((f) => this.mapToDto(f)));
  }

  async follow(
    currentUserId: string,
    userIdToFollow: string,
  ): Promise<UserFollowingDto> {
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
    const existingFollow = (await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToFollow,
        },
      },
    })) as unknown as UserFollowing;

    if (existingFollow) {
      throw new ConflictException('Already following this user');
    }

    // Create follow relationship
    const follow = (await this.prisma.userFollowing.create({
      data: {
        followerId: currentUserId,
        followingId: userIdToFollow,
      },
      include: {
        follower: true,
        following: true,
      },
    })) as unknown as UserFollowing;

    return this.mapToDto(follow);
  }

  async unfollow(
    currentUserId: string,
    userIdToUnfollow: string,
  ): Promise<UserFollowingDto> {
    // Check if relationship exists
    const userFollowing = (await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId: currentUserId,
          followingId: userIdToUnfollow,
        },
      },
    })) as unknown as UserFollowing;

    if (!userFollowing) {
      throw new NotFoundException('Not following this user');
    }

    // Delete the follow relationship
    const deletedUserFollowing = (await this.prisma.userFollowing.delete({
      where: {
        id: userFollowing.id,
      },
      include: {
        follower: true,
        following: true,
      },
    })) as unknown as UserFollowing;

    return this.mapToDto(deletedUserFollowing);
  }

  async isFollowing(followerId: string, followingId: string): Promise<boolean> {
    const follow = (await this.prisma.userFollowing.findUnique({
      where: {
        followerId_followingId: {
          followerId,
          followingId,
        },
      },
    })) as unknown as UserFollowing;

    return !!follow;
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
