import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './models/post.model';
import { PostLike } from './models/post-like.model';
import { PostSave } from './models/post-save.model';

@Injectable()
export class PostsService {
  constructor(private prisma: PrismaService) {}

  private async mapPrismaPostToGraphQLPost(
    prismaPost: any,
    currentUserId?: string,
  ): Promise<Post> {
    const likesCount = await this.prisma.postLike.count({
      where: { postId: prismaPost.id },
    });

    const savesCount = await this.prisma.postSave.count({
      where: { postId: prismaPost.id },
    });

    let isLiked = false;
    let isSaved = false;

    if (currentUserId) {
      const like = await this.prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId: prismaPost.id,
            userId: currentUserId,
          },
        },
      });

      const save = await this.prisma.postSave.findUnique({
        where: {
          postId_userId: {
            postId: prismaPost.id,
            userId: currentUserId,
          },
        },
      });

      isLiked = !!like;
      isSaved = !!save;
    }

    return {
      id: prismaPost.id,
      content: prismaPost.content,
      images: prismaPost.images,
      latitude: prismaPost.latitude,
      longitude: prismaPost.longitude,
      author: prismaPost.author,
      authorId: prismaPost.authorId,
      group: prismaPost.group,
      groupId: prismaPost.groupId,
      comments: prismaPost.comments,
      likesCount,
      savesCount,
      isLiked,
      isSaved,
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
      isActive: prismaPost.isActive,
    };
  }

  async findAll(
    groupId: string,
    authorId?: string,
    currentUserId?: string,
  ): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        groupId,
        ...(authorId && { authorId }),
        isActive: true,
      },
      include: {
        author: true,
        group: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            author: true,
            replies: {
              where: { isActive: true },
              include: { author: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      posts.map((post) => this.mapPrismaPostToGraphQLPost(post, currentUserId)),
    );
  }

  async findOne(id: string, currentUserId?: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        author: true,
        group: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            author: true,
            replies: {
              where: { isActive: true },
              include: { author: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapPrismaPostToGraphQLPost(post, currentUserId);
  }

  async create(
    userId: string,
    createPostInput: CreatePostInput,
  ): Promise<Post> {
    // Create data object, handling undefined groupId
    const postData: any = {
      content: createPostInput.content,
      authorId: userId,
    };

    // Add optional fields if they exist
    if (createPostInput.images) postData.images = createPostInput.images;
    if (createPostInput.latitude !== undefined)
      postData.latitude = createPostInput.latitude;
    if (createPostInput.longitude !== undefined)
      postData.longitude = createPostInput.longitude;
    if (createPostInput.groupId) {
      // Check if user is a member of the group
      const membership = await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: createPostInput.groupId,
            userId,
          },
        },
      });

      if (!membership || membership.status !== 'APPROVED') {
        throw new ForbiddenException(
          'You must be an approved member of the group to create a post',
        );
      }

      postData.groupId = createPostInput.groupId;
    }

    const post = await this.prisma.post.create({
      data: postData,
      include: {
        author: true,
        group: true,
        comments: true,
      },
    });

    return this.mapPrismaPostToGraphQLPost(post, userId);
  }

  async update(
    userId: string,
    updatePostInput: UpdatePostInput,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: updatePostInput.id },
      include: {
        group: {
          include: {
            memberships: {
              where: {
                userId,
                status: 'APPROVED',
              },
            },
          },
        },
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(
        `Post with ID ${updatePostInput.id} not found`,
      );
    }

    // Check if user is the author or an admin of the group
    const isAuthor = post.authorId === userId;
    const isGroupAdmin =
      post.group?.memberships.some(
        (membership) => membership.role === 'ADMIN',
      ) || false;

    if (!isAuthor && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    // If trying to change the group, verify membership in the new group
    if (updatePostInput.groupId && updatePostInput.groupId !== post.groupId) {
      const membership = await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: updatePostInput.groupId,
            userId,
          },
        },
      });

      if (!membership || membership.status !== 'APPROVED') {
        throw new ForbiddenException(
          'You must be an approved member of the group to move a post to that group',
        );
      }
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: updatePostInput.id },
      data: {
        ...updatePostInput,
        updatedAt: new Date(),
      },
      include: {
        author: true,
        group: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            author: true,
            replies: {
              where: { isActive: true },
              include: { author: true },
              orderBy: { createdAt: 'asc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return this.mapPrismaPostToGraphQLPost(updatedPost, userId);
  }

  async remove(userId: string, id: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        group: {
          include: {
            memberships: {
              where: {
                userId,
                status: 'APPROVED',
              },
            },
          },
        },
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the author or an admin of the group
    const isAuthor = post.authorId === userId;
    const isGroupAdmin =
      post.group?.memberships.some(
        (membership) => membership.role === 'ADMIN',
      ) || false;

    if (!isAuthor && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    const deletedPost = await this.prisma.post.update({
      where: { id },
      data: { isActive: false },
      include: {
        author: true,
        group: true,
        comments: true,
      },
    });

    return this.mapPrismaPostToGraphQLPost(deletedPost, userId);
  }

  async likePost(userId: string, postId: string): Promise<PostLike> {
    // Check if post exists and is active
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has already liked the post
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      include: {
        post: true,
        user: true,
      },
    });

    if (existingLike) {
      return existingLike;
    }

    // Create the like
    return this.prisma.postLike.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    });
  }

  async unlikePost(userId: string, postId: string): Promise<string> {
    // Check if post exists and is active
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has liked the post
    const existingLike = await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!existingLike) {
      throw new NotFoundException(`Like not found`);
    }

    // Delete the like
    await this.prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return postId;
  }

  async savePost(userId: string, postId: string): Promise<PostSave> {
    // Check if post exists and is active
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has already saved the post
    const existingSave = await this.prisma.postSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
      include: {
        post: true,
        user: true,
      },
    });

    if (existingSave) {
      return existingSave;
    }

    // Create the save
    return this.prisma.postSave.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    });
  }

  async unsavePost(userId: string, postId: string): Promise<string> {
    // Check if post exists and is active
    const post = await this.prisma.post.findUnique({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has saved the post
    const existingSave = await this.prisma.postSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    if (!existingSave) {
      throw new NotFoundException(`Save not found`);
    }

    // Delete the save
    await this.prisma.postSave.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return postId;
  }
}
