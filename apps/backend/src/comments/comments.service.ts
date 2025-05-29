import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCommentInput } from './dto/create-comment.input';
import { UpdateCommentInput } from './dto/update-comment.input';
import { Comment } from './models/comment.model';
import { GroupMembershipStatus } from '../enums/models/group-membership-status.enum';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';

@Injectable()
export class CommentsService {
  constructor(private prisma: PrismaService) {}

  private mapPrismaCommentToGraphQLComment(prismaComment: any): Comment {
    return {
      id: prismaComment.id,
      content: prismaComment.content,
      post: prismaComment.post,
      postId: prismaComment.postId,
      parentId: prismaComment.parentId,
      parent: prismaComment.parent,
      replies: prismaComment.replies,
      createdBy: prismaComment.createdBy,
      createdById: prismaComment.createdById,
      updatedBy: prismaComment.updatedBy,
      updatedById: prismaComment.updatedById,
      createdAt: prismaComment.createdAt,
      updatedAt: prismaComment.updatedAt,
      isActive: prismaComment.isActive,
    } as Comment;
  }

  async findAll(postId: string): Promise<Comment[]> {
    const comments = await this.prisma.$transaction(async (tx) => {
      return tx.comment.findMany({
        where: {
          postId,
          isActive: true,
          parentId: null, // Only fetch top-level comments
        },
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
      });
    });

    return comments.map((comment) =>
      this.mapPrismaCommentToGraphQLComment(comment),
    );
  }

  async findOne(id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
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

    return this.mapPrismaCommentToGraphQLComment(comment);
  }

  async create(
    userId: string,
    createCommentInput: CreateCommentInput,
  ): Promise<Comment> {
    // Check if the post exists and is active
    const post = await this.prisma.post.findUnique({
      where: { id: createCommentInput.postId },
      include: {
        group: true,
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(
        `Post with ID ${createCommentInput.postId} not found`,
      );
    }

    if (post.groupId) {
      // Check if user is a member of the group
      const membership = await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: post.groupId,
            userId,
          },
        },
      });

      if (!membership || membership.status !== GroupMembershipStatus.APPROVED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to comment on a post',
        );
      }
    }

    // If parentId is provided, check if the parent comment exists and belongs to the same post
    if (createCommentInput.parentId) {
      const parentComment = await this.prisma.comment.findUnique({
        where: { id: createCommentInput.parentId },
      });

      if (!parentComment || !parentComment.isActive) {
        throw new NotFoundException(
          `Parent comment with ID ${createCommentInput.parentId} not found`,
        );
      }

      if (parentComment.postId !== createCommentInput.postId) {
        throw new ForbiddenException(
          'Parent comment must belong to the same post',
        );
      }
    }

    const comment = await this.prisma.comment.create({
      data: {
        content: createCommentInput.content,
        postId: createCommentInput.postId,
        createdById: userId,
        updatedById: userId,
        parentId: createCommentInput.parentId,
      },
      include: {
        createdBy: true,
        updatedBy: true,
        post: true,
        parent: true,
        replies: true,
      },
    });

    return this.mapPrismaCommentToGraphQLComment(comment);
  }

  async update(
    userId: string,
    updateCommentInput: UpdateCommentInput,
  ): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
      where: { id: updateCommentInput.id },
      include: {
        createdBy: true,
        post: {
          include: {
            group: {
              include: {
                memberships: {
                  where: {
                    userId,
                    status: GroupMembershipStatus.APPROVED,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!comment || !comment.isActive) {
      throw new NotFoundException(
        `Comment with ID ${updateCommentInput.id} not found`,
      );
    }

    // Check if user is the creator or an admin of the group (if post has a group)
    const isCreator = comment.createdById === userId;
    const isGroupAdmin =
      comment.post.group?.memberships?.some(
        (membership) => membership.role === 'ADMIN',
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this comment',
      );
    }

    const updatedComment = await this.prisma.comment.update({
      where: { id: updateCommentInput.id },
      data: {
        ...updateCommentInput,
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

    return this.mapPrismaCommentToGraphQLComment(updatedComment);
  }

  async remove(userId: string, id: string): Promise<Comment> {
    const comment = await this.prisma.comment.findUnique({
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
                    status: GroupMembershipStatus.APPROVED,
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
        (membership) => membership.role === GroupMemberRole.ADMIN,
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

    return this.mapPrismaCommentToGraphQLComment(deletedComment);
  }
}
