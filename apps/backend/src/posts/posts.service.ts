import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePostInput } from './dto/create-post.input';
import { UpdatePostInput } from './dto/update-post.input';
import { Post } from './models/post.model';
import { PostLike } from './models/post-like.model';
import { PostSave } from './models/post-save.model';
import { StorageService } from '../core/storage/storage.service';
import { InvitationStatus } from '../enums/models/invitation-status.enum';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { PostDto } from './dto/post.dto';
import { AddressDto } from 'src/addresses/dto/address.dto';
import { UserDto } from 'src/users/dto/user.dto';
import { GroupMembership } from 'src/group-memberships/models/group-membership.model';
import { PostInteractionDto } from './dto/post-interaction.dto';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll(
    groupId?: string,
    createdById?: string,
    limit?: number,
    skip?: number,
    currentUserId?: string,
    authToken?: string,
  ): Promise<PostDto[]> {
    try {
      const posts = (await this.prisma.post.findMany({
        where: {
          ...(groupId && { groupId }),
          ...(createdById && { createdById }),
          isActive: true,
        },
        include: {
          group: true,
          createdBy: true,
          addresses: true,
        },
        take: limit || undefined,
        skip: skip || undefined,
        orderBy: { createdAt: 'desc' },
      })) as unknown as Post[];

      const postsWithGroupMembership = await Promise.all(
        posts.map(async (post) => {
          if (post.group && currentUserId) {
            const isGroupMember = await this.prisma.groupMembership.findUnique({
              where: {
                groupId_userId: {
                  groupId: post.group.id!,
                  userId: currentUserId,
                },
              },
            });

            if (
              (!isGroupMember ||
                isGroupMember.status !== InvitationStatus.ACCEPTED) &&
              post.createdById !== currentUserId
            ) {
              return null;
            }
          }
          return this.mapToDto(post, currentUserId, authToken);
        }),
      );

      return (postsWithGroupMembership.filter(Boolean) as PostDto[]) || [];
    } catch (error) {
      this.logger.error(error);
      throw error;
    }
  }

  async findOne(
    id: string,
    currentUserId?: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = (await this.prisma.post.findUnique({
      where: { id },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        addresses: true,
        comments: {
          where: { isActive: true, parentId: null },
          include: {
            createdBy: true,
            updatedBy: true,
            // replies: {
            //   where: { isActive: true },
            //   include: {
            //     createdBy: true,
            //     updatedBy: true,
            //   },
            //   orderBy: { createdAt: 'asc' },
            // },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapToDto(post, currentUserId, authToken);
  }

  async createPost(
    input: CreatePostInput,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    // Create data object, handling undefined groupId
    const postData: {
      content: string;
      createdById: string;
      updatedById: string;
      groupId?: string;
      images?: string[];
    } = {
      content: input.content,
      createdById: userId,
      updatedById: userId,
    };

    // Process and upload images if they exist
    if (input.images && input.images.length > 0) {
      const processedImages = await Promise.all(
        input.images.map((image, index) =>
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
    if (input.groupId) {
      // Check if user is a member of the group
      const membership = (await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      })) as unknown as GroupMembership;

      if (!membership || membership.status !== InvitationStatus.ACCEPTED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to create a post',
        );
      }

      postData.groupId = input.groupId;
    }

    const createdPost = (await this.prisma.post.create({
      data: postData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        addresses: true,
        comments: true,
      },
    })) as unknown as Post;

    // Create addresses if provided
    if (input.addresses && input.addresses.length > 0) {
      await this.prisma.address.createMany({
        data: input.addresses.map((address) => ({
          postId: createdPost.id,
          type: address.type,
          latitude: address.latitude,
          longitude: address.longitude,
          address: address.address,
          language: address.language,
        })),
      });

      // Fetch the post again with addresses included
      const postWithAddresses = (await this.prisma.post.findUnique({
        where: { id: createdPost.id },
        include: {
          createdBy: true,
          updatedBy: true,
          group: true,
          addresses: true,
          comments: true,
        },
      })) as unknown as Post;

      return this.mapToDto(postWithAddresses, userId, authToken);
    }

    return this.mapToDto(createdPost, userId, authToken);
  }

  async updatePost(
    input: UpdatePostInput,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = (await this.prisma.post.findUnique({
      where: { id: input.id },
      include: {
        createdBy: true,
        group: {
          include: {
            memberships: {
              where: {
                userId,
                status: InvitationStatus.ACCEPTED,
              },
            },
          },
        },
      },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${input.id} not found`);
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdById === userId;
    const isGroupAdmin =
      post.group?.memberships?.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to update this post',
      );
    }

    // If trying to change the group, verify membership in the new group
    if (input.groupId) {
      const membership = (await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      })) as unknown as GroupMembership;

      if (!membership || membership.status !== InvitationStatus.ACCEPTED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to move a post to that group',
        );
      }
    }

    // Process update data
    const updateData: {
      title?: string;
      content?: string;
      updatedById: string;
      updatedAt: Date;
      groupId?: string;
      images?: string[];
      addresses?: any;
    } = {
      ...input,
      updatedById: userId,
      updatedAt: new Date(),
    };

    // Remove addresses from updateData since they're handled separately
    delete updateData.addresses;

    // Process and upload images if they're being updated
    if (input.images && input.images.length > 0) {
      const processedImages = await Promise.all(
        input.images.map(async (image, index) => {
          const imageUrl = await this.processImageUpload(
            image,
            'posts/images',
            `post-${userId}-${index}`,
            authToken,
          );

          if (imageUrl && imageUrl.startsWith('posts/images')) {
            return imageUrl;
          }

          const imageUrlWithoutQuery = imageUrl?.split('?')[0];
          return `posts/images/${imageUrlWithoutQuery?.split('/').pop()}`;
        }),
      );

      updateData.images = processedImages.filter(Boolean);
    }

    const updatedPost = (await this.prisma.post.update({
      where: { id: input.id },
      data: updateData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        addresses: true,
        comments: true,
      },
    })) as unknown as Post;

    // Update addresses if provided
    // Delete existing addresses
    await this.prisma.address.deleteMany({
      where: { postId: input.id },
    });

    if (input.addresses && input.addresses.length > 0) {
      // Create new addresses if any
      if (input.addresses.length > 0) {
        await this.prisma.address.createMany({
          data: input.addresses.map((address) => ({
            postId: input.id,
            type: address.type,
            latitude: address.latitude,
            longitude: address.longitude,
            address: address.address,
            language: address.language,
          })),
        });
      }

      // Fetch the post again with addresses included
      const postWithAddresses = (await this.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          createdBy: true,
          updatedBy: true,
          group: true,
          addresses: true,
          comments: true,
        },
      })) as unknown as Post;

      return this.mapToDto(postWithAddresses, userId, authToken);
    }

    return this.mapToDto(updatedPost, userId, authToken);
  }

  async removePost(
    id: string,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = (await this.prisma.post.findUnique({
      where: { id },
      include: {
        createdBy: true,
        group: {
          include: {
            memberships: {
              where: {
                userId,
                status: InvitationStatus.ACCEPTED,
              },
            },
          },
        },
      },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdById === userId;
    const isGroupAdmin =
      post.group?.memberships?.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      throw new ForbiddenException(
        'You do not have permission to delete this post',
      );
    }

    const deletedPost = (await this.prisma.post.update({
      where: { id },
      data: { isActive: false, updatedById: userId, updatedAt: new Date() },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        comments: true,
      },
    })) as unknown as Post;

    return this.mapToDto(deletedPost, userId, authToken);
  }

  async likePost(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = (await this.prisma.post.findUnique({
      where: { id: postId },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has already liked the post
    const existingLike = (await this.prisma.postLike.findUnique({
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
    })) as unknown as PostLike;

    if (existingLike) {
      return this.mapToInteractionDto(existingLike);
    }

    // Create the like
    const newLike = (await this.prisma.postLike.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    })) as unknown as PostLike;

    return this.mapToInteractionDto(newLike);
  }

  async unlikePost(
    postId: string,
    userId: string,
  ): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = (await this.prisma.post.findUnique({
      where: { id: postId },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has liked the post
    const existingLike = (await this.prisma.postLike.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })) as unknown as PostLike;

    if (!existingLike) {
      throw new NotFoundException(`Like not found`);
    }

    // Delete the like
    const deletedLike = (await this.prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })) as unknown as PostLike;

    return this.mapToInteractionDto(deletedLike);
  }

  async savePost(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = (await this.prisma.post.findUnique({
      where: { id: postId },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has already saved the post
    const existingSave = (await this.prisma.postSave.findUnique({
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
    })) as unknown as PostSave;

    if (existingSave) {
      return this.mapToInteractionDto(existingSave);
    }

    // Create the save
    const newSave = (await this.prisma.postSave.create({
      data: {
        postId,
        userId,
      },
      include: {
        post: true,
        user: true,
      },
    })) as unknown as PostSave;

    return this.mapToInteractionDto(newSave);
  }

  async unsavePost(
    postId: string,
    userId: string,
  ): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = (await this.prisma.post.findUnique({
      where: { id: postId },
    })) as unknown as Post;

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${postId} not found`);
    }

    // Check if user has saved the post
    const existingSave = (await this.prisma.postSave.findUnique({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })) as unknown as PostSave;

    if (!existingSave) {
      throw new NotFoundException(`Save not found`);
    }

    // Delete the save
    const deletedSave = (await this.prisma.postSave.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    })) as unknown as PostSave;

    return this.mapToInteractionDto(deletedSave);
  }

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

  private async mapToDto(
    prismaPost: Post,
    currentUserId?: string,
    authToken?: string,
  ): Promise<PostDto> {
    const likesCount = (await this.prisma.postLike.count({
      where: { postId: prismaPost.id },
    })) as unknown as number;

    const commentsCount = (await this.prisma.comment.count({
      where: { postId: prismaPost.id, parentId: null },
    })) as unknown as number;

    let isLiked = false;
    let isSaved = false;

    if (currentUserId) {
      const like = (await this.prisma.postLike.findUnique({
        where: {
          postId_userId: {
            postId: prismaPost.id,
            userId: currentUserId,
          },
        },
      })) as unknown as PostLike;

      const save = (await this.prisma.postSave.findUnique({
        where: {
          postId_userId: {
            postId: prismaPost.id,
            userId: currentUserId,
          },
        },
      })) as unknown as PostSave;

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

    if (prismaPost.createdBy.avatar) {
      prismaPost.createdBy.avatar = await this.storageService.getSignedUrl(
        prismaPost.createdBy.avatar,
        60,
        authToken,
      );
    }

    return {
      id: prismaPost.id,
      content: prismaPost.content,
      images: processedImages,
      groupName: prismaPost.group?.name,
      addresses: prismaPost.addresses as unknown as AddressDto[],
      likesCount,
      commentsCount,
      isLiked,
      isSaved,
      createdBy: prismaPost.createdBy as unknown as UserDto,
      createdAt: prismaPost.createdAt,
    } as PostDto;
  }

  private mapToInteractionDto(
    prismaInteraction: PostLike | PostSave,
  ): PostInteractionDto {
    return {
      id: prismaInteraction.id,
      postId: prismaInteraction.postId,
      userId: prismaInteraction.userId,
      createdAt: prismaInteraction.createdAt,
    };
  }
}
