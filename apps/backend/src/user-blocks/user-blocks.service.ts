import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { UserBlockDto } from './dto/user-block.dto';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class UserBlocksService {
  private readonly logger = new Logger(UserBlocksService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Block a user
   */
  async blockUser(blockedUserId: string, blockerId: string): Promise<boolean> {
    try {
      // Prevent self-blocking
      if (blockerId === blockedUserId) {
        ExceptionHelper.badRequest('errors.user_block.cannot_block_yourself');
      }

      // Check if user exists
      const blockedUser = await this.prisma.user.findUnique({
        where: { id: blockedUserId },
      });

      if (!blockedUser) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'user',
        });
      }

      // Check if already blocked
      const existingBlock = await this.prisma.userBlock.findFirst({
        where: {
          AND: [
            { blockerId },
            { blockedId: blockedUserId },
            { isActive: true },
          ],
        },
      });

      if (existingBlock) {
        ExceptionHelper.conflict('errors.user_block.already_blocked');
      }

      const block = await this.prisma.userBlock.upsert({
        where: {
          blockerId_blockedId: {
            blockerId,
            blockedId: blockedUserId,
          },
        },
        create: {
          blockerId,
          blockedId: blockedUserId,
        },
        update: {
          isActive: true,
        },
        select: {
          id: true,
        },
      });

      this.logger.log(`User blocked: ${blockerId} blocked ${blockedUserId}`);

      return !!block.id;
    } catch (error: any) {
      this.logger.error(`Failed to block user: ${error.message}`, error.stack);
      throw error;
    }
  }

  /**
   * Unblock a user
   */
  async unblockUser(
    blockedUserId: string,
    blockerId: string,
  ): Promise<boolean> {
    try {
      const block = await this.prisma.userBlock.findFirst({
        where: {
          AND: [
            { blockerId },
            { blockedId: blockedUserId },
            { isActive: true },
          ],
        },
      });

      if (!block) {
        ExceptionHelper.notFound('errors.user_block.block_not_found');
      }

      await this.prisma.userBlock.update({
        where: { id: block.id },
        data: { isActive: false },
      });

      this.logger.log(
        `User unblocked: ${blockerId} unblocked ${blockedUserId}`,
      );

      return true;
    } catch (error: any) {
      this.logger.error(
        `Failed to unblock user: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get blocked users for a user
   */
  async getBlockedUsers(userId: string): Promise<UserBlockDto[]> {
    try {
      const blocks = await this.prisma.userBlock.findMany({
        where: {
          blockerId: userId,
          isActive: true,
        },
        select: {
          id: true,
          createdAt: true,
          blocked: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatar: true,
              city: {
                select: {
                  id: true,
                  value: true,
                },
              },
            },
          },
        },
      });

      const userBlocks = plainToInstance(UserBlockDto, blocks);

      return userBlocks;
    } catch (error: any) {
      this.logger.error(
        `Failed to get blocked users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Check if a user is blocked by another user
   */
  async isUserBlocked(userId: string, otherUserId: string): Promise<boolean> {
    const block = await this.prisma.userBlock.findFirst({
      where: {
        OR: [
          {
            blockerId: userId,
            blockedId: otherUserId,
            isActive: true,
          },
          {
            blockerId: otherUserId,
            blockedId: userId,
            isActive: true,
          },
        ],
      },
    });

    return !!block;
  }

  /**
   * Get all blocked user IDs for a given user (bidirectional)
   * Returns IDs of users that the current user has blocked OR users that have blocked the current user
   */
  async getBlockedUserIds(userId: string): Promise<string[]> {
    try {
      const blocks = await this.prisma.userBlock.findMany({
        where: {
          OR: [
            { blockerId: userId, isActive: true },
            { blockedId: userId, isActive: true },
          ],
        },
        select: {
          blockerId: true,
          blockedId: true,
        },
      });

      // Extract all unique user IDs that are blocked (either direction)
      const blockedIds = new Set<string>();
      blocks.forEach((block) => {
        if (block.blockerId === userId) {
          blockedIds.add(block.blockedId);
        } else {
          blockedIds.add(block.blockerId);
        }
      });

      return Array.from(blockedIds);
    } catch (error: any) {
      this.logger.error(
        `Failed to get blocked user IDs: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  /**
   * Get all blocked user IDs for multiple users (bidirectional)
   * Returns a map of user ID to array of blocked user IDs
   * Returns IDs of users that each user has blocked OR users that have blocked each user
   */
  async getBlockedUserIdsForMultipleUsers(
    userIds: string[],
  ): Promise<Record<string, string[]>> {
    try {
      if (!userIds || userIds.length === 0) {
        return {};
      }

      const blocks = await this.prisma.userBlock.findMany({
        where: {
          OR: [
            { blockerId: { in: userIds }, isActive: true },
            { blockedId: { in: userIds }, isActive: true },
          ],
        },
        select: {
          blockerId: true,
          blockedId: true,
        },
      });

      // Initialize result map with empty arrays for all user IDs
      const result: Record<string, Set<string>> = {};
      userIds.forEach((userId) => {
        result[userId] = new Set<string>();
      });

      // Extract all unique user IDs that are blocked (either direction) for each user
      blocks.forEach((block) => {
        if (result[block.blockerId]) {
          result[block.blockerId].add(block.blockedId);
        }
        if (result[block.blockedId]) {
          result[block.blockedId].add(block.blockerId);
        }
      });

      // Convert Sets to Arrays
      const finalResult: Record<string, string[]> = {};
      Object.keys(result).forEach((userId) => {
        finalResult[userId] = Array.from(result[userId]);
      });

      return finalResult;
    } catch (error: any) {
      this.logger.error(
        `Failed to get blocked user IDs for multiple users: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
