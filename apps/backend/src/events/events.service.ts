import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../core/storage/storage.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventParticipantStatus } from '../enums/models/event-participant-status.enum';
import { RoadType } from '../enums/models/road-type.enum';
import { DifficultyLevel } from '../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../enums/models/experience-level.enum';
import { EventDto } from './dto/event.dto';
import { Event } from './models/event.model';
import { plainToClass } from 'class-transformer';
import { EventStatus } from '../enums/models/event-status.enum';
import { EventInvitationDto } from './dto/event-invitation.dto';
import { ApprovalStatus } from '../enums/models/approval-status.enum';
import { QueueService } from '../core/queue/queue.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { ImageCensorFilterService } from '../core/image-censor-filter/image-censor-filter.service';
import { ImageDto } from '../common/dto/image.dto';
import { TranslatedException } from 'src/core/exceptions/translated-exception';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  private readonly imagePublicUrl: string;

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private queueService: QueueService,
    private profanityFilterService: ProfanityFilterService,
    private imageCensorFilterService: ImageCensorFilterService,
    private configService: ConfigService,
  ) {
    this.imagePublicUrl = `${this.configService.get<string>('IMAGE_PUBLIC_URL')}`;
  }

  async findAll(
    limit?: number,
    skip?: number,
    currentUserId?: string,
    status?: EventStatus,
    groupId?: string,
  ): Promise<EventDto[]> {
    try {
      const baseWhere = {
        isActive: true,
        ...(status && { status }),
        ...(status === EventStatus.DRAFT &&
          currentUserId && { createdById: currentUserId }),
      };

      // Apply privacy filtering based on user access and groupId
      let where;

      if (groupId) {
        // If groupId is provided, filter events for that specific group
        where = {
          ...baseWhere,
          OR: [
            // Private events where the specific group is invited
            {
              isPrivate: true,
              invitedGroups: {
                some: { id: groupId },
              },
            },
          ],
        };
      } else if (currentUserId) {
        // Original user-based filtering

        const groupIds = await this.prisma.groupMembership.findMany({
          where: {
            userId: currentUserId,
            status: ApprovalStatus.ACCEPTED,
            isActive: true,
            group: {
              isActive: true,
            },
          },
          select: {
            groupId: true,
          },
        });

        where = {
          ...baseWhere,
          OR: [
            // Public events
            { isPrivate: false },
            // Private events where user is the creator
            { isPrivate: true, createdById: currentUserId },
            // Private events where user has an invitation
            {
              isPrivate: true,
              invitations: {
                some: {
                  inviteeId: currentUserId,
                },
              },
            },
            {
              isPrivate: true,
              invitedGroups: {
                some: { id: { in: groupIds.map((g) => g.groupId) } },
              },
            },
          ],
        };
      } else {
        // No user or group context, only public events
        where = {
          ...baseWhere,
          isPrivate: false,
        };
      }

      const events = await this.prisma.event.findMany({
        where,
        include: {
          createdBy: true,
          updatedBy: true,
          participants: {
            where: { status: EventParticipantStatus.JOINED, isActive: true },
            include: { createdBy: true },
          },
          addresses: true,
          invitations: {
            where: {
              isActive: true,
            },
            include: {
              invitee: true,
            },
          },
        },
        orderBy: {
          startDateTime: 'asc',
        },
        take: limit || undefined,
        skip: skip || undefined,
      });

      this.logger.log(
        `Found ${events.length} events for user ${currentUserId || 'anonymous'} with privacy filtering`,
      );

      // Map events to GraphQL format with additional fields
      return await Promise.all(
        events.map((event) => this.mapToDto(event as Event, currentUserId)),
      );
    } catch (error) {
      this.logger.error(`Failed to get events`, error);
      throw error;
    }
  }

  async findOne(id: string, currentUserId?: string): Promise<EventDto> {
    try {
      const baseWhere = { id, isActive: true };

      const groupIds = await this.prisma.groupMembership.findMany({
        where: {
          userId: currentUserId,
          status: ApprovalStatus.ACCEPTED,
          isActive: true,
          group: {
            isActive: true,
          },
        },
        select: {
          groupId: true,
        },
      });

      // Apply privacy filtering for individual event access
      const where = currentUserId
        ? {
            ...baseWhere,
            OR: [
              // Public events
              { isPrivate: false },
              // Private events where user is the creator
              { isPrivate: true, createdById: currentUserId },
              // Private events where user has an invitation
              {
                isPrivate: true,
                invitations: {
                  some: {
                    inviteeId: currentUserId,
                  },
                },
              },
              {
                isPrivate: true,
                invitedGroups: {
                  some: { id: { in: groupIds.map((g) => g.groupId) } },
                },
              },
            ],
          }
        : {
            ...baseWhere,
            isPrivate: false,
          };

      const event = await this.prisma.event.findFirst({
        where,
        include: {
          createdBy: true,
          updatedBy: true,
          organizedByGroup: {
            include: {
              city: true,
            },
          },
          participants: {
            where: { status: EventParticipantStatus.JOINED, isActive: true },
            include: { createdBy: true },
          },
          addresses: true,
          invitedGroups: {
            include: {
              city: true,
            },
          },
          invitations: {
            where: {
              isActive: true,
            },
            include: {
              invitee: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                  avatar: true,
                },
              },
            },
          },
        },
      });

      if (!event || !event.isActive) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'event',
          id,
        });
      }

      this.logger.log(
        `User ${currentUserId || 'anonymous'} accessed event ${id} (private: ${event.isPrivate})`,
      );

      // Map event to GraphQL format with additional fields
      return this.mapToDto(event as Event, currentUserId);
    } catch (error) {
      this.logger.error(`Failed to get event with ID ${id}`, error);
      throw error;
    }
  }

  /**
   * Find all invitations for the current user where event status is upcoming and isActive is true
   */
  async findAllInvitations(
    limit?: number,
    skip?: number,
    currentUserId?: string,
  ): Promise<EventInvitationDto[]> {
    try {
      const invitations = await this.prisma.eventInvitation.findMany({
        where: {
          status: ApprovalStatus.PENDING,
          inviteeId: currentUserId,
          isActive: true,
          event: {
            status: EventStatus.UPCOMING,
            isActive: true,
          },
        },
        include: {
          event: {
            include: {
              createdBy: true,
              organizedByGroup: {
                include: {
                  city: true,
                },
              },
            },
          },
        },
        orderBy: {
          createdAt: 'desc',
        },
        take: limit,
        skip: skip,
      });

      this.logger.log(
        `Found ${invitations.length} invitations for user ${currentUserId}`,
      );

      return invitations.map((invitation) => {
        const invitationDto = plainToClass(EventInvitationDto, invitation);

        // Process images from JSONB array
        const images: ImageDto[] = [];
        if (invitation.event.images) {
          try {
            const imageArray = Array.isArray(invitation.event.images)
              ? invitation.event.images
              : (JSON.parse(JSON.stringify(invitation.event.images)) as any[]);

            if (Array.isArray(imageArray) && imageArray.length > 0) {
              imageArray.forEach((imageData: any) => {
                if (
                  imageData &&
                  typeof imageData === 'object' &&
                  'url' in imageData
                ) {
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
        invitationDto.event.images = images;

        return invitationDto;
      });
    } catch (error) {
      this.logger.error('Error finding invitations:', error);
      ExceptionHelper.badRequest('errors.event.failed_to_fetch_invitations');
    }
  }

  async create(
    input: CreateEventInput,
    userId: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      const {
        title,
        description,
        eventType,
        status,
        startDateTime,
        endDateTime,
        maxParticipants,
        isPrivate,
        images,
        addresses,
        invitedGroupIds,
        invitedUserIds,
        organizedByGroupId,
        roadType,
        difficultyLevel,
        routeDescription,
        restStops,
        campingInfo,
        equipmentChecklist,
        instructorInfo,
        topicsCovered,
        experienceLevel,
        price,
        currency,
      } = input;

      // Process and upload images if they exist
      let processedImages: any;
      if (images && images.length > 0) {
        const imageResults = await Promise.all(
          images.map(async (image, index) => {
            const imagePath = await this.storageService.processImageUpload(
              image,
              'events/images',
              `event-${userId}-${index}`,
              authToken,
            );

            if (!imagePath) return null;

            // Get public URL for censorship check
            const publicUrl = `${this.imagePublicUrl}/${imagePath}`;
            const { isCensored } =
              await this.imageCensorFilterService.checkImageCensorContent(
                publicUrl,
              );

            return {
              url: publicUrl,
              isCensored,
              order: index,
            };
          }),
        );

        processedImages = imageResults.filter(Boolean);
      }

      // Use transaction to ensure atomicity
      const event = await this.prisma.$transaction(async (tx) => {
        // Create the event first
        const createdEvent = await tx.event.create({
          data: {
            title,
            description,
            eventType,
            status,
            startDateTime,
            endDateTime,
            maxParticipants: isPrivate ? null : maxParticipants,
            isPrivate:
              (invitedGroupIds && invitedGroupIds?.length > 0) ||
              (invitedUserIds && invitedUserIds?.length > 0),
            images: processedImages,
            organizedByGroupId: organizedByGroupId || null,
            roadType: roadType as RoadType,
            difficultyLevel: difficultyLevel as DifficultyLevel,
            routeDescription,
            restStops,
            campingInfo,
            equipmentChecklist,
            instructorInfo,
            topicsCovered,
            experienceLevel: experienceLevel as ExperienceLevel,
            price: price ? parseFloat(price) : null,
            currency,
            createdById: userId,
            updatedById: userId,
            // Handle addresses
            addresses: addresses?.length
              ? {
                  createMany: {
                    data: addresses.map((addr) => ({
                      address: addr.address,
                      language: addr.language,
                      type: addr.type,
                      latitude: addr.latitude,
                      longitude: addr.longitude,
                      countryCode: addr.countryCode,
                    })),
                  },
                }
              : undefined,
            // Handle invited groups if provided
            invitedGroups: invitedGroupIds?.length
              ? {
                  connect: invitedGroupIds.map((id) => ({ id })),
                }
              : undefined,
            // Handle invited users through invitations if provided
            invitations: invitedUserIds?.length
              ? {
                  createMany: {
                    data: invitedUserIds.map((inviteeId) => ({
                      inviteeId: inviteeId,
                      createdById: userId,
                    })),
                  },
                }
              : undefined,
          },
          include: {
            createdBy: true,
            updatedBy: true,
            organizedByGroup: {
              include: {
                city: true,
              },
            },
            addresses: true,
            invitedGroups: {
              include: {
                city: true,
              },
            },
            invitations: {
              include: {
                invitee: true,
              },
            },
          },
        });

        // If event status is UPCOMING and there are invited groups, create invitations for all group members
        if (status === EventStatus.UPCOMING && invitedGroupIds?.length) {
          this.logger.log(
            `Creating invitations for group members in event ${createdEvent.id}`,
          );

          // Get all members from invited groups with ACCEPTED status
          const groupMembers = await tx.groupMembership.findMany({
            where: {
              groupId: {
                in: invitedGroupIds,
              },
              group: {
                isActive: true,
              },
              status: ApprovalStatus.ACCEPTED,
              isActive: true,
            },
            select: {
              userId: true,
            },
          });

          // Extract unique user IDs (in case a user is in multiple invited groups)
          const uniqueUserIds = [
            ...new Set(groupMembers.map((member) => member.userId)),
          ];

          // If organized by group, don't filter out the event creator
          // If not organized by group, filter out the event creator to avoid self-invitation
          const inviteeIds = organizedByGroupId
            ? uniqueUserIds
            : uniqueUserIds.filter((id) => id !== userId);

          if (inviteeIds.length > 0) {
            // Create invitations for all group members
            await tx.eventInvitation.createMany({
              data: inviteeIds.map((inviteeId) => ({
                eventId: createdEvent.id,
                inviteeId: inviteeId,
                createdById: userId,
                status: ApprovalStatus.PENDING,
              })),
              skipDuplicates: true, // Skip if invitation already exists
            });

            this.logger.log(
              `Created ${inviteeIds.length} invitations for group members in event ${createdEvent.id}`,
            );
          }
        }

        // If event is NOT organized by a group, automatically add the event creator as a participant
        if (!organizedByGroupId) {
          await tx.eventParticipant.create({
            data: {
              eventId: createdEvent.id,
              status: EventParticipantStatus.JOINED,
              createdById: userId,
            },
          });

          this.logger.log(
            `Added event creator ${userId} as participant to event ${createdEvent.id}`,
          );
        }

        return createdEvent;
      });

      if (event.invitations?.length) {
        // Send notification to the user
        await this.queueService.addBulkNotificationJob(
          {
            userIds: event.invitations.map(
              (invitation) => invitation.inviteeId,
            ),
            title: 'event.invitation.title',
            body: 'event.invitation.body',
            type: NotificationType.EVENT_INVITATION,
            channels: NotificationChannel.PUSH,
            data: {
              eventDate: event.startDateTime,
              eventName: event.title,
            } as Record<string, any>,
          },
          userId,
        );
      }

      return this.mapToDto(event, userId);
    } catch (error) {
      this.logger.error(`Failed to create event`, error);
      throw error;
    }
  }

  async update(
    input: UpdateEventInput,
    userId: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      const {
        id,
        title,
        description,
        eventType,
        status,
        startDateTime,
        endDateTime,
        maxParticipants,
        isPrivate,
        images,
        addresses,
        invitedGroupIds,
        invitedUserIds,
        organizedByGroupId,
        roadType,
        difficultyLevel,
        routeDescription,
        restStops,
        campingInfo,
        equipmentChecklist,
        instructorInfo,
        topicsCovered,
        experienceLevel,
        price,
        currency,
      } = input;

      // Process and upload images if they exist
      let processedImages: any;
      if (images && images.length > 0) {
        const imageResults = await Promise.all(
          images.map(async (image, index) => {
            const imagePath = await this.storageService.processImageUpload(
              image,
              'events/images',
              `event-${userId}-${index}`,
              authToken,
            );

            if (!imagePath) return null;

            // Normalize path
            let normalizedPath = imagePath;
            if (imagePath.startsWith('events/images')) {
              normalizedPath = imagePath;
            } else {
              const imageUrlWithoutQuery = imagePath.split('?')[0];
              normalizedPath = `events/images/${imageUrlWithoutQuery.split('/').pop()}`;
            }

            // Get public URL for censorship check
            const publicUrl = `${this.imagePublicUrl}/${normalizedPath}`;
            const { isCensored } =
              await this.imageCensorFilterService.checkImageCensorContent(
                publicUrl,
              );

            return {
              url: publicUrl,
              isCensored,
              order: index,
            };
          }),
        );

        processedImages = imageResults.filter(Boolean);
      }

      // First get the current event to handle relationships properly
      const currentEvent = await this.prisma.event.findFirst({
        where: { id, isActive: true },
      });

      if (!currentEvent) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'event',
          id,
        });
      }

      // Use transaction to ensure atomicity with increased timeout
      const event = await this.prisma.$transaction(
        async (tx) => {
          // Update the event
          const updatedEvent = await tx.event.update({
            where: { id, isActive: true },
            data: {
              title,
              description,
              ...(currentEvent.status === EventStatus.DRAFT
                ? { eventType }
                : {}),
              ...(currentEvent.status === EventStatus.DRAFT ? { status } : {}),
              startDateTime,
              endDateTime,
              maxParticipants,
              ...(currentEvent.status === EventStatus.DRAFT
                ? { isPrivate }
                : {}),
              images: processedImages,
              roadType: roadType as RoadType,
              difficultyLevel: difficultyLevel as DifficultyLevel,
              routeDescription,
              restStops,
              campingInfo,
              equipmentChecklist,
              instructorInfo,
              topicsCovered,
              experienceLevel: experienceLevel as ExperienceLevel,
              price: price ? parseFloat(price) : null,
              currency,
              // Handle organized by fields
              ...(currentEvent.status === EventStatus.DRAFT
                ? { organizedByGroupId: organizedByGroupId || null }
                : {}),
              updatedById: userId,
              updatedAt: new Date(),
              // Handle addresses update - delete old ones if new ones provided
              addresses: addresses?.length
                ? {
                    deleteMany: {}, // Delete old addresses
                    createMany: {
                      data: addresses.map((addr) => ({
                        address: addr.address,
                        language: addr.language,
                        type: addr.type,
                        countryCode: addr.countryCode,
                        latitude: addr.latitude,
                        longitude: addr.longitude,
                      })),
                    },
                  }
                : undefined,
              ...(currentEvent.status === EventStatus.DRAFT
                ? {
                    invitedGroups: {
                      set:
                        invitedGroupIds?.map((groupId) => ({ id: groupId })) ||
                        [],
                    },
                  }
                : {}),
            },
            include: {
              createdBy: true,
              updatedBy: true,
              organizedByGroup: {
                include: {
                  city: true,
                },
              },
              addresses: true,
              invitedGroups: {
                include: {
                  city: true,
                },
              },
              invitations: {
                include: {
                  invitee: true,
                },
              },
            },
          });

          // Handle direct user invitations separately for better performance
          if (
            invitedUserIds !== undefined &&
            currentEvent.status === EventStatus.DRAFT
          ) {
            // First, deactivate all existing invitations in a single query
            await tx.eventInvitation.updateMany({
              where: {
                eventId: id,
                isActive: true,
              },
              data: {
                isActive: false,
              },
            });

            // Then create new invitations if any
            if (
              invitedUserIds.length > 0 &&
              currentEvent.status === EventStatus.DRAFT
            ) {
              await tx.eventInvitation.createMany({
                data: invitedUserIds.map((inviteeId) => ({
                  eventId: id,
                  inviteeId: inviteeId,
                  createdById: userId,
                  status: ApprovalStatus.PENDING,
                })),
                skipDuplicates: true,
              });
            }
          }

          // If event status is UPCOMING and there are invited groups, create invitations for all group members
          if (
            currentEvent.status === EventStatus.DRAFT &&
            status === EventStatus.UPCOMING &&
            invitedGroupIds?.length
          ) {
            this.logger.log(
              `Creating invitations for group members in event ${updatedEvent.id} after update`,
            );

            // Get all members from invited groups with ACCEPTED status
            const groupMembers = await tx.groupMembership.findMany({
              where: {
                groupId: {
                  in: invitedGroupIds,
                },
                group: {
                  isActive: true,
                },
                status: ApprovalStatus.ACCEPTED,
                isActive: true,
              },
              select: {
                userId: true,
              },
            });

            // Extract unique user IDs (in case a user is in multiple invited groups)
            const uniqueUserIds = [
              ...new Set(groupMembers.map((member) => member.userId)),
            ];

            // If organized by group, don't filter out the event creator
            // If not organized by group, filter out the event creator to avoid self-invitation
            const inviteeIds = organizedByGroupId
              ? uniqueUserIds
              : uniqueUserIds.filter((id) => id !== userId);

            if (inviteeIds.length > 0) {
              // Create invitations for all group members
              await tx.eventInvitation.createMany({
                data: inviteeIds.map((inviteeId) => ({
                  eventId: updatedEvent.id,
                  inviteeId: inviteeId,
                  createdById: userId,
                  status: ApprovalStatus.PENDING,
                })),
                skipDuplicates: true, // Skip if invitation already exists
              });

              this.logger.log(
                `Created ${inviteeIds.length} invitations for group members in event ${updatedEvent.id}`,
              );
            }
          }

          return updatedEvent;
        },
        {
          timeout: 30000, // Increase timeout to 30 seconds for complex updates
        },
      );

      // Send EVENT_UPDATED notification to all participants
      try {
        const participants = await this.prisma.eventParticipant.findMany({
          where: {
            eventId: id,
            status: EventParticipantStatus.JOINED,
            isActive: true,
          },
          select: {
            createdById: true,
          },
        });

        if (participants.length > 0) {
          const participantIds = participants
            .filter((participant) => participant.createdById !== userId)
            .map((p) => p.createdById);

          if (participantIds.length > 0) {
            await this.queueService.addBulkNotificationJob(
              {
                userIds: participantIds,
                title: 'event.updated.title',
                body: 'event.updated.body',
                type: NotificationType.EVENT_UPDATED,
                channels: NotificationChannel.PUSH,
                data: {
                  eventId: event.id,
                  eventName: event.title,
                } as Record<string, any>,
              },
              userId,
            );

            this.logger.log(
              `Sent update notifications to ${participantIds.length} participants for event ${id}`,
            );
          }
        }
      } catch (error) {
        this.logger.error('Failed to send event updated notification', error);
      }

      return this.mapToDto(event as Event, userId);
    } catch (error) {
      this.logger.error(`Failed to update event`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<string> {
    try {
      // Use transaction to ensure all related data is updated atomically
      const result = await this.prisma.$transaction(async (tx) => {
        // Check if event is draft
        const draftEvent = await tx.event.findFirst({
          where: {
            id,
            isActive: true,
            status: EventStatus.DRAFT,
            createdById: userId,
          },
        });

        if (!draftEvent) {
          ExceptionHelper.notFound('errors.common.not_found_with_id', {
            resource: 'event',
            id,
          });
        }

        if (draftEvent?.createdById !== userId) {
          ExceptionHelper.badRequest('errors.event.cannot_remove');
        }

        // Update event to inactive
        const updatedEvent = await tx.event.update({
          where: {
            id,
            isActive: true,
            status: EventStatus.DRAFT,
            createdById: userId,
          },
          data: {
            isActive: false,
            updatedBy: { connect: { id: userId } },
            updatedAt: new Date(),
          },
        });

        // Update all related invitations to inactive
        await tx.eventInvitation.updateMany({
          where: {
            eventId: id,
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });

        // Update all related participants to inactive
        await tx.eventParticipant.updateMany({
          where: {
            eventId: id,
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });

        this.logger.log(
          `Event ${id} and all related invitations and participants set to inactive`,
        );

        return updatedEvent;
      });

      return result.isActive === false ? id : '';
    } catch (error) {
      this.logger.error(`Failed to remove event`, error);
      throw error;
    }
  }

  async cancel(eventId: string, userId: string): Promise<string> {
    try {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, isActive: true, status: EventStatus.UPCOMING },
        include: {
          participants: {
            where: { status: EventParticipantStatus.JOINED, isActive: true },
            select: { createdById: true },
          },
        },
      });

      if (!event) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'event',
          id: eventId,
        });
      }

      // Check if user is the event creator
      if (event.createdById === userId) {
        ExceptionHelper.badRequest('errors.event.cannot_leave');
      }

      // Use transaction to ensure all related data is updated atomically
      const result = await this.prisma.$transaction(async (tx) => {
        // Update event status to CANCELLED
        const updatedEvent = await tx.event.update({
          where: { id: eventId },
          data: {
            status: EventStatus.CANCELLED,
            isActive: false,
            updatedBy: { connect: { id: userId } },
            updatedAt: new Date(),
          },
        });

        // Update all related invitations to inactive
        await tx.eventInvitation.updateMany({
          where: {
            eventId: eventId,
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });

        // Update all related participants to inactive
        await tx.eventParticipant.updateMany({
          where: {
            eventId: eventId,
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: new Date(),
          },
        });

        this.logger.log(
          `Event ${eventId} cancelled and all related invitations and participants set to inactive`,
        );

        return updatedEvent;
      });

      // Send notifications to all participants
      if (event.participants && event.participants.length > 0) {
        const participantIds = event.participants.map((p) => p.createdById);

        await this.queueService.addBulkNotificationJob(
          {
            userIds: participantIds,
            title: 'event.cancelled.title',
            body: 'event.cancelled.body',
            type: NotificationType.EVENT_CANCELLED,
            channels: NotificationChannel.PUSH,
            data: {
              eventId: event.id,
              eventName: event.title,
            } as Record<string, any>,
          },
          userId,
        );

        this.logger.log(
          `Sent cancellation notifications to ${participantIds.length} participants for event ${eventId}`,
        );
      }

      return result.isActive === false ? eventId : '';
    } catch (error) {
      this.logger.error(`Failed to cancel event`, error);
      throw error;
    }
  }

  async join(eventId: string, userId: string): Promise<EventDto> {
    try {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, isActive: true, status: EventStatus.UPCOMING },
      });

      if (!event) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'event',
          id: eventId,
        });
      }

      const invitation = await this.prisma.eventInvitation.findFirst({
        where: {
          eventId,
          inviteeId: userId,
          isActive: true,
          status: ApprovalStatus.PENDING,
          event: {
            isActive: true,
            status: EventStatus.UPCOMING,
          },
        },
      });

      // Use transaction to ensure data consistency
      await this.prisma.$transaction(async (tx) => {
        // Create or update event participant
        await tx.eventParticipant.upsert({
          where: {
            eventId_createdById: {
              eventId,
              createdById: userId,
            },
          },
          create: {
            event: { connect: { id: eventId } },
            createdBy: { connect: { id: userId } },
            status: EventParticipantStatus.JOINED,
          },
          update: {
            status: EventParticipantStatus.JOINED,
            updatedBy: { connect: { id: userId } },
            updatedAt: new Date(),
          },
        });

        // Update invitation status if exists
        if (invitation) {
          await tx.eventInvitation.update({
            where: { id: invitation.id },
            data: {
              status: ApprovalStatus.ACCEPTED,
              updatedBy: { connect: { id: userId } },
              updatedAt: new Date(),
            },
          });
        }
      });

      return await this.findOne(eventId, userId);
    } catch (error) {
      this.logger.error(`Failed to join event`, error);
      throw error;
    }
  }

  async leave(eventId: string, userId: string): Promise<EventDto> {
    try {
      const event = await this.prisma.event.findFirst({
        where: {
          id: eventId,
          isActive: true,
          status: EventStatus.UPCOMING,
        },
        include: {
          createdBy: true,
        },
      });

      if (!event) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'event',
          id: eventId,
        });
      }

      if (event.createdBy.id === userId && !event.organizedByGroupId) {
        ExceptionHelper.badRequest('errors.event.cannot_leave');
      }
      const participant = await this.prisma.eventParticipant.findFirst({
        where: {
          eventId,
          createdById: userId,
        },
      });

      if (!participant) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'participant',
        });
      }

      await this.prisma.eventParticipant.update({
        where: { id: participant.id },
        data: {
          status: EventParticipantStatus.LEFT,
          updatedBy: { connect: { id: userId } },
          updatedAt: new Date(),
        },
      });

      return await this.findOne(eventId, userId);
    } catch (error) {
      this.logger.error(`Failed to leave event`, error);
      throw error;
    }
  }

  /**
   * Accept an event invitation
   */
  async acceptInvitation(
    invitationId: string,
    currentUserId: string,
  ): Promise<boolean> {
    try {
      // First, verify the invitation exists and belongs to the current user
      const invitation = await this.prisma.eventInvitation.findFirst({
        where: {
          id: invitationId,
          inviteeId: currentUserId,
          isActive: true,
          status: ApprovalStatus.PENDING,
          event: {
            isActive: true,
            status: EventStatus.UPCOMING,
          },
        },
        include: {
          event: true,
        },
      });

      if (!invitation) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'invitation',
        });
      }

      // Use transaction to ensure both operations succeed or fail together
      const result = await this.prisma.$transaction(async (tx) => {
        // Update invitation status to ACCEPTED
        const updatedInvitation = await tx.eventInvitation.update({
          where: { id: invitationId },
          data: {
            status: ApprovalStatus.ACCEPTED,
            updatedById: currentUserId,
            updatedAt: new Date(),
          },
        });

        // Add user as participant to the event
        await tx.eventParticipant.create({
          data: {
            eventId: invitation.eventId,
            status: EventParticipantStatus.JOINED,
            createdById: currentUserId,
          },
        });

        return updatedInvitation;
      });

      this.logger.log(
        `User ${currentUserId} accepted invitation ${invitationId}`,
      );

      return !!result;
    } catch (error) {
      this.logger.error('Error accepting invitation:', error);
      if (error instanceof TranslatedException) {
        ExceptionHelper.badRequest('errors.event.failed_to_accept_invitation');
      }
      return false;
    }
  }

  /**
   * Reject an event invitation
   */
  async rejectInvitation(
    invitationId: string,
    currentUserId: string,
  ): Promise<boolean> {
    try {
      // First, verify the invitation exists and belongs to the current user
      const invitation = await this.prisma.eventInvitation.findFirst({
        where: {
          id: invitationId,
          inviteeId: currentUserId,
          isActive: true,
          status: ApprovalStatus.PENDING,
          event: {
            isActive: true,
            status: EventStatus.UPCOMING,
          },
        },
      });

      if (!invitation) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'invitation',
        });
      }

      // Update invitation status to REJECTED
      const updatedInvitation = await this.prisma.eventInvitation.update({
        where: { id: invitationId },
        data: {
          status: ApprovalStatus.REJECTED,
          updatedById: currentUserId,
          updatedAt: new Date(),
        },
      });

      this.logger.log(
        `User ${currentUserId} rejected invitation ${invitationId}`,
      );

      return !!updatedInvitation;
    } catch (error) {
      this.logger.error('Error rejecting invitation:', error);
      if (error instanceof TranslatedException) {
        ExceptionHelper.badRequest('errors.event.failed_to_reject_invitation');
      }
      ExceptionHelper.badRequest('errors.event.failed_to_reject_invitation');
    }
  }

  // Helper method to map Prisma event to DTO with additional calculated fields
  private mapToDto(event: any, currentUserId?: string): EventDto {
    try {
      // Process images from JSONB array
      const images: ImageDto[] = [];

      if (event.images) {
        try {
          const imageArray = Array.isArray(event.images)
            ? event.images
            : (JSON.parse(JSON.stringify(event.images)) as any[]);

          if (Array.isArray(imageArray) && imageArray.length > 0) {
            imageArray.forEach((imageData: any) => {
              if (
                imageData &&
                typeof imageData === 'object' &&
                'url' in imageData
              ) {
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

      // Calculate if current user is participating and their status
      let isParticipating = false;
      let participationStatus: string | null = null;

      if (currentUserId && event.participants) {
        const participation = event.participants.find(
          (p) => p.createdById === currentUserId,
        );

        isParticipating = !!participation;
        participationStatus = participation?.status || null;
      }

      // Calculate number of participants
      const participantsCount = event.participants
        ? event.participants.filter(
            (p) => p.status === EventParticipantStatus.JOINED,
          ).length
        : 0;

      // Apply profanity filter to text content
      const filteredTitle = event.title
        ? this.profanityFilterService.filterText(event.title)
        : event.title;
      const filteredDescription = event.description
        ? this.profanityFilterService.filterText(event.description)
        : event.description;
      const filteredRouteDescription = event.routeDescription
        ? this.profanityFilterService.filterText(event.routeDescription)
        : event.routeDescription;
      const filteredRestStops = event.restStops
        ? this.profanityFilterService.filterText(event.restStops)
        : event.restStops;
      const filteredCampingInfo = event.campingInfo
        ? this.profanityFilterService.filterText(event.campingInfo)
        : event.campingInfo;
      const filteredEquipmentChecklist = event.equipmentChecklist
        ? this.profanityFilterService.filterText(event.equipmentChecklist)
        : event.equipmentChecklist;
      const filteredInstructorInfo = event.instructorInfo
        ? this.profanityFilterService.filterText(event.instructorInfo)
        : event.instructorInfo;
      const filteredTopicsCovered = event.topicsCovered
        ? this.profanityFilterService.filterText(event.topicsCovered)
        : event.topicsCovered;

      // Process invited users from invitations
      const processedInvitedUsers =
        event.invitations.map((invitation) => {
          return invitation.invitee;
        }) || [];

      // Process invited groups (no avatar processing needed for groups)
      const processedInvitedGroups = event.invitedGroups || [];

      // Create base DTO with transformed data
      const eventWithExtras = {
        ...event,
        title: filteredTitle,
        description: filteredDescription,
        routeDescription: filteredRouteDescription,
        restStops: filteredRestStops,
        campingInfo: filteredCampingInfo,
        equipmentChecklist: filteredEquipmentChecklist,
        instructorInfo: filteredInstructorInfo,
        topicsCovered: filteredTopicsCovered,
        images: images,
        invitedUsers: processedInvitedUsers,
        invitedGroups: processedInvitedGroups,
        isParticipating,
        participationStatus,
        participantsCount,
      };

      return plainToClass(EventDto, eventWithExtras);
    } catch (error) {
      this.logger.error(`Failed to map event to DTO`, error);
      throw error;
    }
  }
}
