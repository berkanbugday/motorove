import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostCommentInput } from './dto/create-post-comment.input';
import { UpdatePostCommentInput } from './dto/update-post-comment.input';
import { PostComment } from './models/post-comment.model';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { GroupMembership } from '../group-memberships/models/group-membership.model';
import { PostCommentDto } from './dto/post-comment.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class PostCommentsService {
  private readonly logger = new Logger(PostCommentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    postId: string,
    limit?: number,
    skip?: number,
  ): Promise<PostCommentDto[]> {
    try {
      const where = {
        postId,
        isActive: true,
      };

      const postComments = (await this.prisma.postComment.findMany({
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
      })) as PostComment[];

      return await Promise.all(
        postComments.map((postComment) => this.mapToDto(postComment)),
      );
    } catch (error) {
      this.logger.error(`Failed to get comments for post ${postId}`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<PostCommentDto> {
    try {
      const postComment = (await this.prisma.postComment.findFirst({
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
      })) as PostComment;

      if (!postComment || !postComment.isActive) {
        throw new NotFoundException(`Post comment with ID ${id} not found`);
      }

      return this.mapToDto(postComment);
    } catch (error) {
      this.logger.error(`Failed to get post comment with ID ${id}`, error);
      throw error;
    }
  }

  async create(
    input: CreatePostCommentInput,
    userId: string,
  ): Promise<PostCommentDto> {
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
        const parentPostComment = (await this.prisma.postComment.findFirst({
          where: { id: input.parentId },
        })) as PostComment;

        if (!parentPostComment || !parentPostComment.isActive) {
          throw new NotFoundException(
            `Parent post comment with ID ${input.parentId} not found`,
          );
        }

        if (parentPostComment.postId !== input.postId) {
          throw new ForbiddenException(
            'Parent post comment must belong to the same post',
          );
        }
      }

      const postComment = (await this.prisma.postComment.create({
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
      })) as PostComment;

      return this.mapToDto(postComment);
    } catch (error) {
      this.logger.error(`Failed to create comment`, error);
      throw error;
    }
  }

  async update(
    input: UpdatePostCommentInput,
    userId: string,
  ): Promise<PostCommentDto> {
    try {
      const postComment = (await this.prisma.postComment.findFirst({
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
      })) as PostComment;

      if (!postComment || !postComment.isActive) {
        throw new NotFoundException(
          `Post comment with ID ${input.id} not found`,
        );
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = postComment.createdById === userId;
      const isGroupAdmin =
        postComment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        throw new ForbiddenException(
          'You do not have permission to update this post comment',
        );
      }

      const updatedPostComment = (await this.prisma.postComment.update({
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
      })) as PostComment;

      return this.mapToDto(updatedPostComment);
    } catch (error) {
      this.logger.error(`Failed to update post comment`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<PostCommentDto> {
    try {
      const postComment = (await this.prisma.postComment.findFirst({
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
      })) as PostComment;

      if (!postComment || !postComment.isActive) {
        throw new NotFoundException(`Post comment with ID ${id} not found`);
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = postComment.createdById === userId;
      const isGroupAdmin =
        postComment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        throw new ForbiddenException(
          'You do not have permission to delete this post comment',
        );
      }

      const deletedPostComment = (await this.prisma.postComment.update({
        where: { id },
        data: { isActive: false, updatedById: userId },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
          parent: true,
          replies: true,
        },
      })) as PostComment;

      return this.mapToDto(deletedPostComment);
    } catch (error) {
      this.logger.error(`Failed to delete post comment`, error);
      throw error;
    }
  }

  private mapToDto(postComment: PostComment): PostCommentDto {
    const dto = plainToClass(PostCommentDto, postComment);

    // Handle nested replies recursively
    if (postComment.replies && postComment.replies.length > 0) {
      dto.replies = postComment.replies.map((reply) => this.mapToDto(reply));
    }

    // Handle parent comment if exists
    if (postComment.parent) {
      dto.parent = this.mapToDto(postComment.parent);
    }

    return dto;
  }
}
