import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
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
        },
      })) as PostComment;

      if (!postComment || !postComment.isActive) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'post_comment',
          id,
        });
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
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'post',
        });
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
          ExceptionHelper.forbidden('errors.common.cannot_perform_action', {
            resource: 'create_post_comment',
          });
        }
      }

      const postComment = (await this.prisma.postComment.create({
        data: {
          content: input.content,
          postId: input.postId,
          createdById: userId,
          updatedById: userId,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
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
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'post_comment',
          id: input.id,
        });
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = postComment.createdById === userId;
      const isGroupAdmin =
        postComment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        ExceptionHelper.forbidden('errors.post_comment.cannot_update');
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
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'post_comment',
          id,
        });
      }

      // Check if user is the creator or an admin of the group (if post has a group)
      const isCreator = postComment.createdById === userId;
      const isGroupAdmin =
        postComment.post.group?.memberships?.some(
          (membership: GroupMembership) =>
            membership.role === GroupMemberRole.ADMIN,
        ) || false;

      if (!isCreator && !isGroupAdmin) {
        ExceptionHelper.forbidden('errors.post_comment.cannot_delete');
      }

      const deletedPostComment = (await this.prisma.postComment.update({
        where: { id },
        data: { isActive: false, updatedById: userId },
        include: {
          createdBy: true,
          updatedBy: true,
          post: true,
        },
      })) as PostComment;

      return this.mapToDto(deletedPostComment);
    } catch (error) {
      this.logger.error(`Failed to delete post comment`, error);
      throw error;
    }
  }

  private mapToDto(postComment: PostComment): PostCommentDto {
    return plainToClass(PostCommentDto, postComment);
  }
}
