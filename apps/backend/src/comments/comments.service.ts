import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './models/comment.model';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { FilterCommentInput } from './dto/filter-comment.input';
import { GroupMembership } from '../group-memberships/models/group-membership.model';
import { CommentDto } from './dto/comment.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CommentsService {
  private readonly logger = new Logger(CommentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    postId: string,
    limit?: number,
    skip?: number,
    filters?: FilterCommentInput,
  ): Promise<CommentDto[]> {
    try {
      const where = {
        postId,
        isActive: filters?.isActive || true,
        parentId: filters?.parentId || null,
        ...(filters?.createdById && { createdById: filters.createdById }),
      };

      const comments = await this.prisma.comment.findMany({
        where,
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          replies: {
            where: { isActive: true },
            include: {
              createdBy: true,
              updatedBy: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: skip || undefined,
        take: limit || undefined,
      });

      return await Promise.all(
        comments.map((comment) => this.mapToDto(comment as Comment)),
      );
    } catch (error) {
      this.logger.error(`Failed to get comments for post ${postId}`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CommentDto> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: { id },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          parent: {
            include: {
              createdBy: true,
              updatedBy: true,
            },
          },
          replies: {
            where: { isActive: true },
            include: {
              createdBy: true,
              updatedBy: true,
            },
            orderBy: { createdAt: 'asc' },
          },
        },
      });

      if (!comment || !comment.isActive) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      return this.mapToDto(comment as Comment);
    } catch (error) {
      this.logger.error(`Failed to get comment with ID ${id}`, error);
      throw error;
    }
  }

  async create(input: CreateCommentInput, userId: string): Promise<CommentDto> {
    try {
      // Check if the post exists and is active
      const post = await this.prisma.post.findFirst({
        where: { id: input.postId },
        include: {
          group: true,
        },
      });

      if (!post || !post.isActive) {
        throw new NotFoundException(`Post with ID ${input.postId} not found`);
      }

      if (post.groupId) {
        // Check if user is a member of the group
        const membership = await this.prisma.groupMembership.findFirst({
          where: {
            groupId: post.groupId,
            userId,
          },
        });

        if (!membership || membership.status !== ApprovalStatus.ACCEPTED) {
          throw new ForbiddenException(
            'You must be an approved member of the group to comment on a post',
          );
        }
      }

      // If parentId is provided, check if the parent comment exists and belongs to the same post
      if (input.parentId) {
        const parentComment = await this.prisma.comment.findFirst({
          where: { id: input.parentId },
        });

        if (!parentComment || !parentComment.isActive) {
          throw new NotFoundException(
            `Parent comment with ID ${input.parentId} not found`,
          );
        }

        if (parentComment.postId !== input.postId) {
          throw new ForbiddenException(
            'Parent comment must belong to the same post',
          );
        }
      }

      const comment = await this.prisma.comment.create({
        data: {
          content: input.content,
          postId: input.postId,
          createdById: userId,
          updatedById: userId,
          parentId: input.parentId,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          parent: true,
          replies: true,
        },
      });

      return this.mapToDto(comment as Comment);
    } catch (error) {
      this.logger.error(`Failed to create comment`, error);
      throw error;
    }
  }

  async update(input: UpdateCommentInput, userId: string): Promise<CommentDto> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: { id: input.id },
        include: {
          createdBy: true,
          post: {
            include: {
              group: {
                include: {
                  memberships: {
                    where: {
                      userId,
                      status: ApprovalStatus.ACCEPTED,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!comment || !comment.isActive) {
        throw new NotFoundException(`Comment with ID ${input.id} not found`);
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = comment.createdById === userId;
      const isGroupAdmin =
        comment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        throw new ForbiddenException(
          'You do not have permission to update this comment',
        );
      }

      const updatedComment = await this.prisma.comment.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedById: userId,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          parent: true,
          replies: true,
        },
      });

      return this.mapToDto(updatedComment as Comment);
    } catch (error) {
      this.logger.error(`Failed to update comment`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<CommentDto> {
    try {
      const comment = await this.prisma.comment.findFirst({
        where: { id },
        include: {
          createdBy: true,
          post: {
            include: {
              group: {
                include: {
                  memberships: {
                    where: {
                      userId,
                      status: ApprovalStatus.ACCEPTED,
                    },
                  },
                },
              },
            },
          },
        },
      });

      if (!comment || !comment.isActive) {
        throw new NotFoundException(`Comment with ID ${id} not found`);
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = comment.createdById === userId;
      const isGroupAdmin =
        comment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        throw new ForbiddenException(
          'You do not have permission to delete this comment',
        );
      }

      const deletedComment = await this.prisma.comment.update({
        where: { id },
        data: { isActive: false, updatedById: userId },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          parent: true,
          replies: true,
        },
      });

      return this.mapToDto(deletedComment as Comment);
    } catch (error) {
      this.logger.error(`Failed to delete comment`, error);
      throw error;
    }
  }

  private mapToDto(comment: Comment): CommentDto {
    const dto = plainToClass(CommentDto, comment);

    // Handle nested replies recursively
    if (comment.replies && comment.replies.length > 0) {
      dto.replies = comment.replies.map((reply) => this.mapToDto(reply));
    }

    // Handle parent comment if exists
    if (comment.parent) {
      dto.parent = this.mapToDto(comment.parent);
    }

    return dto;
  }
}
