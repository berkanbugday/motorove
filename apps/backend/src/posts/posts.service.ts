import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './models/post.model';
import { PostLike } from './models/post-like.model';
import { PostSave } from './models/post-save.model';
import { StorageService } from '../core/storage/storage.service';
import { PrismaPost } from './interfaces/prisma-post.interface';
import { GroupMembershipStatus } from '../enums/models/group-membership-status.enum';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';

@Injectable()
export class PostsService {
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  // Process base64 image and upload to Supabase storage
  private async processImageUpload(
    base64Image: string | null | undefined,
    path: string,
    filePrefix: string,
    authToken?: string,
  ): Promise<string | undefined> {
    if (!base64Image) return undefined;

    try {
      // Check if it's a URL or base64 data
      if (base64Image.startsWith('http')) {
        return base64Image; // Already a URL, just return it
      }

      // Extract content type
      const contentType = this.getContentTypeFromBase64(base64Image);
      const filename = `${filePrefix}-${Date.now()}`;

      // Upload to Supabase storage
      const imageUrl = await this.storageService.uploadFile(
        base64Image,
        path,
        {
          contentType,
          filename,
        },
        authToken,
      );

      return imageUrl;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error';
      throw new BadRequestException(`Failed to upload image: ${errorMessage}`);
    }
  }

  // Extract content type from base64 data
  private getContentTypeFromBase64(base64Data: string): string {
    if (base64Data.includes('data:')) {
      const matches = base64Data.match(
        /data:([a-zA-Z0-9]+\/[a-zA-Z0-9-.+]+);base64,/,
      );
      if (matches && matches.length > 1) {
        return matches[1];
      }
    }
    return 'image/jpeg'; // Default
  }

  private async mapPrismaPostToGraphQLPost(
    prismaPost: PrismaPost,
    currentUserId?: string,
    authToken?: string,
  ): Promise<Post> {
    const likesCount = await this.prisma.postLike.count({
      where: { postId: prismaPost.id },
    });

    const commentsCount = await this.prisma.comment.count({
      where: { postId: prismaPost.id, parentId: null },
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

    // Process images to get signed URLs if needed
    let processedImages = prismaPost.images || [];

    if (
      Array.isArray(processedImages) &&
      processedImages.length > 0 &&
      authToken
    ) {
      try {
        processedImages = await Promise.all(
          processedImages.map(async (imageUrl) => {
            if (imageUrl && typeof imageUrl === 'string') {
              return await this.storageService.getSignedUrl(
                imageUrl,
                60,
                authToken,
              );
            }
            return imageUrl;
          }),
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Error getting signed URLs:', errorMessage);
      }
    }

    return {
      id: prismaPost.id,
      content: prismaPost.content,
      images: processedImages,
      latitude: prismaPost.latitude,
      longitude: prismaPost.longitude,
      group: prismaPost.group,
      comments: prismaPost.comments || [],
      likesCount,
      commentsCount,
      isLiked,
      isSaved,
      createdBy: prismaPost.createdBy,
      updatedBy: prismaPost.updatedBy,
      createdAt: prismaPost.createdAt,
      updatedAt: prismaPost.updatedAt,
      isActive: prismaPost.isActive,
    } as Post;
  }

  async findAll(
    groupId?: string,
    createdById?: string,
    currentUserId?: string,
    authToken?: string,
    limit?: number,
    skip?: number,
  ): Promise<Post[]> {
    const posts = await this.prisma.post.findMany({
      where: {
        ...(groupId && { groupId }),
        ...(createdById && { createdById }),
        isActive: true,
      },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            createdBy: true,
            updatedBy: true,
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
        },
      },
      take: limit || undefined,
      skip: skip || undefined,
      orderBy: { createdAt: 'desc' },
    });

    return Promise.all(
      posts.map((post) =>
        this.mapPrismaPostToGraphQLPost(post, currentUserId, authToken),
      ),
    );
  }

  async findOne(
    id: string,
    currentUserId?: string,
    authToken?: string,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            createdBy: true,
            updatedBy: true,
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
        },
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapPrismaPostToGraphQLPost(post, currentUserId, authToken);
  }

  async create(
    userId: string,
    createPostInput: CreatePostInput,
    authToken?: string,
  ): Promise<Post> {
    // Create data object, handling undefined groupId
    const postData: any = {
      content: createPostInput.content,
      createdById: userId,
      updatedById: userId,
    };

    // Process and upload images if they exist
    if (createPostInput.images && createPostInput.images.length > 0) {
      const processedImages = await Promise.all(
        createPostInput.images.map((image, index) =>
          this.processImageUpload(
            image,
            'posts/images',
            `post-${userId}-${index}`,
            authToken,
          ),
        ),
      );

      postData.images = processedImages.filter(Boolean) as string[];
    }

    // Add optional fields if they exist
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

      if (!membership || membership.status !== GroupMembershipStatus.APPROVED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to create a post',
        );
      }

      postData.groupId = createPostInput.groupId;
    }

    const post = await this.prisma.post.create({
      data: postData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: true,
      },
    });

    return this.mapPrismaPostToGraphQLPost(post, userId, authToken);
  }

  async update(
    userId: string,
    updatePostInput: UpdatePostInput,
    authToken?: string,
  ): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id: updatePostInput.id },
      include: {
        createdBy: true,
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
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(
        `Post with ID ${updatePostInput.id} not found`,
      );
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdById === userId;
    const isGroupAdmin =
      post.group?.memberships.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
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

      if (!membership || membership.status !== GroupMembershipStatus.APPROVED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to move a post to that group',
        );
      }
    }

    // Process update data
    const updateData: any = {
      ...updatePostInput,
      updatedById: userId,
      updatedAt: new Date(),
    };

    // Process and upload images if they're being updated
    if (updatePostInput.images && updatePostInput.images.length > 0) {
      const processedImages = await Promise.all(
        updatePostInput.images.map((image, index) =>
          this.processImageUpload(
            image,
            'posts/images',
            `post-${userId}-${index}`,
            authToken,
          ),
        ),
      );

      updateData.images = processedImages.filter(Boolean) as string[];
    }

    const updatedPost = await this.prisma.post.update({
      where: { id: updatePostInput.id },
      data: updateData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: true,
      },
    });

    return this.mapPrismaPostToGraphQLPost(updatedPost, userId, authToken);
  }

  async remove(userId: string, id: string, authToken?: string): Promise<Post> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        createdBy: true,
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
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdById === userId;
    const isGroupAdmin =
      post.group?.memberships.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    const deletedPost = await this.prisma.post.update({
      where: { id },
      data: { isActive: false, updatedById: userId, updatedAt: new Date() },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: true,
      },
    });

    return this.mapPrismaPostToGraphQLPost(deletedPost, userId, authToken);
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
      return existingLike as PostLike;
    }

    // Create the like
    const newLike = await this.prisma.postLike.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    return newLike as PostLike;
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
      return existingSave as PostSave;
    }

    // Create the save
    const newSave = await this.prisma.postSave.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    });

    return newSave as PostSave;
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
