import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
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
import { UserDto } from '../users/dto/user.dto';
import { PostInteractionDto } from './dto/post-interaction.dto';
import { PostCommentDto } from '../post-comments/dto/post-comment.dto';
import { ImageCensorFilterService } from '../core/image-censor-filter/image-censor-filter.service';
import { ImageDto } from '../common/dto/image.dto';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { PostAddressDto } from './dto/post-address.dto';
import { QueueService } from '../core/queue/queue.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PostsService {
  private readonly logger = new Logger(PostsService.name);
  private readonly imagePublicUrl: string;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private imageCensorFilterService: ImageCensorFilterService,
    private profanityFilterService: ProfanityFilterService,
    private queueService: QueueService,
    private configService: ConfigService,
  ) {
    // Construct public URL from environment variables
    const supabaseUrl = this.configService.get<string>('SUPABASE_URL');
    const bucketName = this.configService.get<string>(
      'SUPABASE_STORAGE_BUCKET',
    );
    this.imagePublicUrl = `${supabaseUrl}/storage/v1/object/public/${bucketName}/`;
  }

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
            const isGroupMember = await this.prisma.groupMembership.findFirst({
              where: {
                groupId: post.group.id,
                userId: currentUserId,
                isActive: true,
                status: ApprovalStatus.ACCEPTED,
              },
            });

            if (!isGroupMember && post.createdById !== currentUserId) {
              return null;
            }
          }

          await Promise.all(
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
                const following = await this.prisma.userFollowing.findFirst({
                  where: {
                    followerId: currentUserId,
                    followingId: user.id,
                    isActive: true,
                  },
                });

                if (following) {
                  user.followingStatus = following.status as ApprovalStatus;
                }
              }
            }),
          );

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
    const post = await this.prisma.post.findFirst({
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
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id,
      });
    }

    return this.mapToDto(post as Post, currentUserId, authToken);
  }

  async create(
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
      images?: any;
    } = {
      content: input.content,
      createdById: userId,
      updatedById: userId,
    };

    // Process and upload images if they exist
    if (input.images && input.images.length > 0) {
      const processedImages = await Promise.all(
        input.images.map(async (image, index) => {
          const imagePath = await this.processImageUpload(
            image,
            'posts/images',
            `post-${userId}-${index}`,
            authToken,
          );

          if (!imagePath) return null;

          // Get public URL for censorship check
          const publicUrl = `${this.imagePublicUrl}${imagePath}`;
          const { isCensored } =
            await this.imageCensorFilterService.checkImageCensorContent(
              publicUrl,
            );

          return {
            url: publicUrl, // Store path only, not full URL
            isCensored,
            order: index,
          };
        }),
      );

      postData.images = processedImages.filter(Boolean);
    }

    // Add optional fields if they exist
    if (input.groupId) {
      // Check if user is a member of the group
      const membership = await this.prisma.groupMembership.findFirst({
        where: {
          groupId: input.groupId,
          userId,
        },
      });

      if (!membership || membership.status !== ApprovalStatus.ACCEPTED) {
        ExceptionHelper.forbidden('errors.common.cannot_perform_action', {
          resource: 'create_post',
        });
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
      await this.prisma.postAddress.createMany({
        data: input.addresses.map((address) => ({
          postId: createdPost.id,
          latitude: address.latitude,
          longitude: address.longitude,
          address: address.address,
          language: address.language,
          countryCode: address.countryCode,
        })),
      });

      // Fetch the post again with addresses included
      const postWithAddresses = await this.prisma.post.findFirst({
        where: { id: createdPost.id },
        include: {
          createdBy: true,
          updatedBy: true,
          group: true,
          addresses: true,
        },
      });

      // Send SHARED_POST_IN_GROUP notification if post is in a group
      if (postWithAddresses?.group) {
        await this.notifyGroupMembersAboutNewPost(postWithAddresses as Post);
      }

      return this.mapToDto(postWithAddresses as Post, userId, authToken);
    }

    // Send SHARED_POST_IN_GROUP notification if post is in a group (no addresses case)
    if (createdPost.group) {
      await this.notifyGroupMembersAboutNewPost(createdPost as Post);
    }

    return this.mapToDto(createdPost as Post, userId, authToken);
  }

  async update(
    input: UpdatePostInput,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = await this.prisma.post.findFirst({
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
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id: input.id,
      });
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdBy.id === userId;
    const isGroupAdmin =
      post.group?.memberships?.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      ExceptionHelper.forbidden('errors.post.cannot_update');
    }

    // If trying to change the group, verify membership in the new group
    if (input.groupId) {
      const membership = await this.prisma.groupMembership.findFirst({
        where: {
          groupId: input.groupId,
          userId,
        },
      });

      if (!membership || membership.status !== ApprovalStatus.ACCEPTED) {
        ExceptionHelper.forbidden('errors.common.cannot_perform_action', {
          resource: 'update_post',
        });
      }
    }

    // Process update data
    const updateData: {
      title?: string;
      content?: string;
      updatedById: string;
      updatedAt: Date;
      groupId?: string;
      images?: any;
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
          const imagePath = await this.processImageUpload(
            image,
            'posts/images',
            `post-${userId}-${index}`,
            authToken,
          );

          if (!imagePath) return null;

          // Normalize path
          let normalizedPath = imagePath;
          if (imagePath.startsWith('posts/images')) {
            normalizedPath = imagePath;
          } else {
            const imageUrlWithoutQuery = imagePath.split('?')[0];
            normalizedPath = `posts/images/${imageUrlWithoutQuery.split('/').pop()}`;
          }

          // Get public URL for censorship check
          const publicUrl = `${this.imagePublicUrl}${normalizedPath}`;
          const { isCensored } =
            await this.imageCensorFilterService.checkImageCensorContent(
              publicUrl,
            );

          return {
            url: publicUrl, // Store path only, not full URL
            isCensored,
            order: index,
          };
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
    await this.prisma.postAddress.deleteMany({
      where: { postId: input.id },
    });

    if (input.addresses && input.addresses.length > 0) {
      // Create new addresses if any
      if (input.addresses.length > 0) {
        await this.prisma.postAddress.createMany({
          data: input.addresses.map((address) => ({
            postId: input.id,
            latitude: address.latitude,
            longitude: address.longitude,
            address: address.address,
            language: address.language,
          })),
        });
      }

      // Fetch the post again with addresses included
      const postWithAddresses = await this.prisma.post.findFirst({
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

  async remove(
    id: string,
    userId: string,
    authToken?: string,
  ): Promise<PostDto> {
    const post = await this.prisma.post.findFirst({
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
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id,
      });
    }

    // Check if user is the creator or an admin of the group
    const isCreator = post.createdById === userId;
    const isGroupAdmin =
      post.group?.memberships?.some(
        (membership) => membership.role === GroupMemberRole.ADMIN,
      ) || false;

    if (!isCreator && !isGroupAdmin) {
      ExceptionHelper.forbidden('errors.post.cannot_delete');
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

  async like(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id: postId,
      });
    }

    // Check if user has already liked the post
    const existingLike = await this.prisma.postLike.findFirst({
      where: {
        postId,
        userId,
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
        post: {
          include: {
            createdBy: true,
          },
        },
        user: true,
      },
    });

    // Send notification to post owner (if not liking own post)
    if (post.createdById !== userId) {
      try {
        await this.queueService.addNotificationJob(
          {
            userId: post.createdById,
            title: 'post.like.title',
            body: 'post.like.body',
            type: NotificationType.POST_LIKE,
            channel: NotificationChannel.PUSH,
            data: {
              postId: post.id,
              userId: userId,
              userFullName: `${newLike.user.firstName} ${newLike.user.lastName}`,
            } as Record<string, any>,
          },
          userId,
        );
      } catch (error) {
        this.logger.error('Failed to send POST_LIKE notification', error);
      }
    }

    return this.mapToInteractionDto(newLike as PostLike);
  }

  async unlike(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id: postId,
      });
    }

    // Check if user has liked the post
    const existingLike = await this.prisma.postLike.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingLike) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'like',
      });
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

  async save(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id: postId,
      });
    }

    // Check if user has already saved the post
    const existingSave = await this.prisma.postSave.findFirst({
      where: {
        postId,
        userId,
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
        post: {
          include: {
            createdBy: true,
          },
        },
        user: true,
      },
    });

    // Send notification to post owner (if not saving own post)
    if (post.createdById !== userId) {
      try {
        await this.queueService.addNotificationJob(
          {
            userId: post.createdById,
            title: 'post.save.title',
            body: 'post.save.body',
            type: NotificationType.POST_SAVE,
            channel: NotificationChannel.PUSH,
            data: {
              postId: post.id,
              userId: userId,
              userFullName: `${newSave.user.firstName} ${newSave.user.lastName}`,
            } as Record<string, any>,
          },
          userId,
        );
      } catch (error) {
        this.logger.error('Failed to send POST_SAVE notification', error);
      }
    }

    return this.mapToInteractionDto(newSave as PostSave);
  }

  async unsave(postId: string, userId: string): Promise<PostInteractionDto> {
    // Check if post exists and is active
    const post = await this.prisma.post.findFirst({
      where: { id: postId },
    });

    if (!post || !post.isActive) {
      ExceptionHelper.notFound('errors.common.not_found_with_id', {
        resource: 'post',
        id: postId,
      });
    }

    // Check if user has saved the post
    const existingSave = await this.prisma.postSave.findFirst({
      where: {
        postId,
        userId,
      },
    });

    if (!existingSave) {
      ExceptionHelper.notFound('errors.common.not_found', {
        resource: 'save',
      });
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
      ExceptionHelper.badRequest('errors.common.failed_to_upload_with_error', {
        resource: 'image',
        error: errorMessage,
      });
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
    post: Post,
    currentUserId?: string,
    authToken?: string,
  ): Promise<PostDto> {
    const likesCount = await this.prisma.postLike.count({
      where: { postId: post.id },
    });

    const commentsCount = await this.prisma.postComment.count({
      where: { postId: post.id, isActive: true },
    });

    let isLiked = false;
    let isSaved = false;

    if (currentUserId) {
      const like = await this.prisma.postLike.findFirst({
        where: {
          postId: post.id,
          userId: currentUserId,
        },
      });

      const save = await this.prisma.postSave.findFirst({
        where: {
          postId: post.id,
          userId: currentUserId,
        },
      });

      isLiked = !!like;
      isSaved = !!save;
    }

    // Process images from JSONB array
    const images: ImageDto[] = [];

    if (post.images) {
      try {
        const imageArray = Array.isArray(post.images)
          ? post.images
          : (JSON.parse(JSON.stringify(post.images)) as any[]);

        if (Array.isArray(imageArray) && imageArray.length > 0) {
          imageArray.forEach((imageData: any) => {
            if (
              imageData &&
              typeof imageData === 'object' &&
              'url' in imageData
            ) {
              // Use public URL prefix instead of signed URLs
              images.push({
                url: String(imageData.url),
                isCensored: Boolean(imageData.isCensored),
                order: Number(imageData.order) || 0,
              });
            }
          });

          // Sort by order
          images.sort((a, b) => a.order - b.order);
        }
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        this.logger.error('Error processing images:', errorMessage);
      }
    }

    if (post.createdBy.avatar) {
      post.createdBy.avatar = await this.storageService.getSignedUrl(
        post.createdBy.avatar,
        3600,
        authToken,
      );
    }

    if (post.comments?.length) {
      await Promise.all(
        post.comments.map(async (comment) => {
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
      id: post.id,
      content: this.profanityFilterService.filterText(post.content),
      images: images,
      groupId: post.group?.id,
      groupName: post.group?.name,
      addresses: post.addresses as PostAddressDto[],
      likesCount,
      commentsCount,
      isLiked,
      isSaved,
      createdBy: post.createdBy as UserDto,
      createdAt: post.createdAt,
      likedUsers: post.likes?.map((like) => like.user) || [],
      comments:
        post.comments?.map((comment) => comment as PostCommentDto) || [],
    } as PostDto;
  }

  private mapToInteractionDto(
    interaction: PostLike | PostSave,
  ): PostInteractionDto {
    return {
      id: interaction.id,
      postId: interaction.postId,
      userId: interaction.userId,
      createdAt: interaction.createdAt,
    };
  }

  /**
   * Notifies group members about a new post shared in the group
   * @param post - The created post with group and creator information
   */
  private async notifyGroupMembersAboutNewPost(post: Post): Promise<void> {
    try {
      const groupMembers = await this.prisma.groupMembership.findMany({
        where: { groupId: post.group?.id },
        include: {
          user: {
            select: {
              id: true,
            },
          },
        },
      });

      if (!groupMembers) {
        return;
      }

      const memberUserIds = groupMembers
        .filter((membership) => membership.user.id !== post.createdBy.id)
        .map((membership) => membership.user.id);

      if (memberUserIds.length === 0) {
        return;
      }

      await this.sendGroupPostNotification(memberUserIds, post);
    } catch (error) {
      this.logger.error(
        'Failed to send shared post in group notification',
        error,
      );
    }
  }

  /**
   * Sends bulk notification to group members about a new post
   * @param memberUserIds - Array of user IDs to notify
   * @param post - The created post
   */
  private async sendGroupPostNotification(
    memberUserIds: string[],
    post: Post,
  ): Promise<void> {
    const userFullName = `${post.createdBy.firstName} ${post.createdBy.lastName}`;

    await this.queueService.addBulkNotificationJob(
      {
        userIds: memberUserIds,
        title: 'post.shared_in_group.title',
        body: 'post.shared_in_group.body',
        type: NotificationType.SHARED_POST_IN_GROUP,
        channels: NotificationChannel.PUSH,
        data: {
          postId: post.id,
          groupId: post.group?.id,
          groupName: post.group?.name,
          userFullName: userFullName,
        } as Record<string, any>,
      },
      post.createdBy.id!,
    );
  }
}
