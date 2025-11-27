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
          },
          {
            blockerId: otherUserId,
            blockedId: userId,
          },
        ],
        isActive: true,
      },
    });

    return !!block;
  }
}
