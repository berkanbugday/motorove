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
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { GroupMemberRole } from '../enums/models/group-member-role.enum';
import { PostDto } from './dto/post.dto';
import { AddressDto } from '../addresses/dto/address.dto';
import { UserDto } from '../users/dto/user.dto';
import { PostInteractionDto } from './dto/post-interaction.dto';
import { CommentDto } from '../comments/dto/comment.dto';
import { ImageCensorFilterService } from '../core/image-censor-filter/image-censor-filter.service';
import { ImageDto } from './dto/image.dto';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private imageCensorFilterService: ImageCensorFilterService,
    private profanityFilterService: ProfanityFilterService,
  ) {}

  async findAll(
    groupId?: string,
    createdById?: string,
    savedById?: string,
    limit?: number,
    skip?: number,
    currentUserId?: string,
    authToken?: string,
  ): Promise<PostDto[]> {
    try {
      const posts = await this.prisma.post.findMany({
        where: {
          ...(groupId && { groupId }),
          ...(createdById && { createdById }),
          ...(savedById && { saves: { some: { userId: savedById } } }),
          isActive: true,
        },
        include: {
          group: true,
          createdBy: true,
          addresses: true,
          likes: {
            include: {
              user: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
        take: limit || undefined,
        skip: skip || undefined,
        orderBy: { createdAt: 'desc' },
      });

      const postsWithGroupMembership = await Promise.all(
        posts.map(async (post) => {
          if (post.group && currentUserId) {
            const isGroupMember = await this.prisma.groupMembership.findUnique({
              where: {
                groupId_userId: {
                  groupId: post.group.id,
                  userId: currentUserId,
                },
              },
            });

            if (
              (!isGroupMember ||
                isGroupMember.status !== ApprovalStatus.ACCEPTED) &&
              post.createdById !== currentUserId
            ) {
              return null;
            }
          }

          post.likes.map(async (like) => {
            const user = like.user as UserDto;

            // Get signed URL for avatar if exists
            if (user.avatar && authToken) {
              try {
                user.avatar = await this.storageService.getSignedUrl(
                  user.avatar,
                  3600,
                  authToken,
                );
              } catch (error) {
                this.logger.error(
                  `Error getting signed URL for avatar: ${error.message}`,
                );
              }
            }

            // Check following status
            if (currentUserId) {
              const following = await this.prisma.userFollowing.findUnique({
                where: {
                  followerId_followingId: {
                    followerId: currentUserId,
                    followingId: user.id,
                  },
                  isActive: true,
                  follower: { isActive: true },
                  following: { isActive: true },
                },
              });

              if (following) {
                user.followingStatus = following.status as ApprovalStatus;
              }
            }
          });

          return this.mapToDto(post as Post, currentUserId, authToken);
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
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        group: true,
        createdBy: true,
        addresses: true,
        likes: {
          include: {
            user: {
              include: {
                city: true,
              },
            },
          },
        },
        comments: {
          where: {
            isActive: true,
          },
          include: {
            createdBy: true,
          },
          orderBy: {
            createdAt: 'asc',
          },
        },
      },
    });

    if (!post || !post.isActive) {
      throw new NotFoundException(`Post with ID ${id} not found`);
    }

    return this.mapToDto(post as Post, currentUserId, authToken);
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
      const membership = await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      });

      if (!membership || membership.status !== ApprovalStatus.ACCEPTED) {
        throw new ForbiddenException(
          'You must be an approved member of the group to create a post',
        );
      }

      postData.groupId = input.groupId;
    }

    const createdPost = await this.prisma.post.create({
      data: postData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        addresses: true,
      },
    });

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
      const postWithAddresses = await this.prisma.post.findUnique({
        where: { id: createdPost.id },
        include: {
          createdBy: true,
          updatedBy: true,
          group: true,
          addresses: true,
        },
      });

      return this.mapToDto(postWithAddresses as Post, userId, authToken);
    }

    return this.mapToDto(createdPost as Post, userId, authToken);
  }

  async updatePost(
    input: UpdatePostInput,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id: input.id },
      include: {
        createdBy: true,
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
    });

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
      const membership = await this.prisma.groupMembership.findUnique({
        where: {
          groupId_userId: {
            groupId: input.groupId,
            userId,
          },
        },
      });

      if (!membership || membership.status !== ApprovalStatus.ACCEPTED) {
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

    const updatedPost = await this.prisma.post.update({
      where: { id: input.id },
      data: updateData,
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
        addresses: true,
      },
    });

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
      const postWithAddresses = await this.prisma.post.findUnique({
        where: { id: input.id },
        include: {
          createdBy: true,
          updatedBy: true,
          group: true,
          addresses: true,
        },
      });

      return this.mapToDto(postWithAddresses as Post, userId, authToken);
    }

    return this.mapToDto(updatedPost as Post, userId, authToken);
  }

  async removePost(
    id: string,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = await this.prisma.post.findUnique({
      where: { id },
      include: {
        createdBy: true,
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
    });

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

    const deletedPost = await this.prisma.post.update({
      where: { id },
      data: { isActive: false, updatedById: userId, updatedAt: new Date() },
      include: {
        createdBy: true,
        updatedBy: true,
        group: true,
      },
    });

    return this.mapToDto(deletedPost as Post, userId, authToken);
  }

  async likePost(postId: string, userId: string): Promise<PostInteractionDto> {
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
      return this.mapToInteractionDto(existingLike as PostLike);
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

    return this.mapToInteractionDto(newLike as PostLike);
  }

  async unlikePost(
    postId: string,
    userId: string,
  ): Promise<PostInteractionDto> {
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
    const deletedLike = await this.prisma.postLike.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return this.mapToInteractionDto(deletedLike as PostLike);
  }

  async savePost(postId: string, userId: string): Promise<PostInteractionDto> {
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
      return this.mapToInteractionDto(existingSave as PostSave);
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

    return this.mapToInteractionDto(newSave as PostSave);
  }

  async unsavePost(
    postId: string,
    userId: string,
  ): Promise<PostInteractionDto> {
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
    const deletedSave = await this.prisma.postSave.delete({
      where: {
        postId_userId: {
          postId,
          userId,
        },
      },
    });

    return this.mapToInteractionDto(deletedSave as PostSave);
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
    const likesCount = await this.prisma.postLike.count({
      where: { postId: prismaPost.id },
    });

    const commentsCount = await this.prisma.comment.count({
      where: { postId: prismaPost.id, parentId: null, isActive: true },
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
    const images: ImageDto[] = [];

    if (
      Array.isArray(prismaPost.images) &&
      prismaPost.images.length > 0 &&
      authToken
    ) {
      try {
        await Promise.all(
          prismaPost.images.map(async (imageUrl) => {
            if (imageUrl && typeof imageUrl === 'string') {
              const url = await this.storageService.getSignedUrl(
                imageUrl,
                3600,
                authToken,
              );
              const { isCensored } =
                await this.imageCensorFilterService.checkImageCensorContent(
                  url,
                );
              images.push({ url: url, isCensored });
            }
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
        3600,
        authToken,
      );
    }

    if (prismaPost.comments?.length) {
      await Promise.all(
        prismaPost.comments.map(async (comment) => {
          if (comment.createdBy.avatar) {
            comment.createdBy.avatar = await this.storageService.getSignedUrl(
              comment.createdBy.avatar,
              3600,
              authToken,
            );
          }

          comment.content = this.profanityFilterService.filterText(
            comment.content,
          );
        }),
      );
    }

    return {
      id: prismaPost.id,
      content: this.profanityFilterService.filterText(prismaPost.content),
      images: images,
      groupId: prismaPost.group?.id,
      groupName: prismaPost.group?.name,
      addresses: prismaPost.addresses as AddressDto[],
      likesCount,
      commentsCount,
      isLiked,
      isSaved,
      createdBy: prismaPost.createdBy as UserDto,
      createdAt: prismaPost.createdAt,
      likedUsers: prismaPost.likes?.map((like) => like.user) || [],
      comments:
        prismaPost.comments?.map((comment) => comment as CommentDto) || [],
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
