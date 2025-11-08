import {
  Injectable,
  BadRequestException,
  NotFoundException,
  Logger,
} from '@nestjs/common';
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
import { EventParticipant } from '../events/models/event-participant.model';
import { QueueService } from '../core/queue/queue.service';
import { NotificationType } from '../enums/models/notification-type.enum';
import { NotificationChannel } from '../enums/models/notification-channel.enum';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { ImageCensorFilterService } from '../core/image-censor-filter/image-censor-filter.service';
import { ImageDto } from '../common/dto/image.dto';

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
    private queueService: QueueService,
    private profanityFilterService: ProfanityFilterService,
    private imageCensorFilterService: ImageCensorFilterService,
  ) {}

  async findAll(
    limit?: number,
    skip?: number,
    currentUserId?: string,
    authToken?: string,
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
            where: { status: EventParticipantStatus.JOINED },
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
        events.map((event) =>
          this.mapToDto(event as Event, currentUserId, authToken),
        ),
      );
    } catch (error) {
      this.logger.error(`Failed to get events`, error);
      throw error;
    }
  }

  async findOne(
    id: string,
    currentUserId?: string,
    authToken?: string,
  ): Promise<EventDto> {
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
            where: { status: EventParticipantStatus.JOINED },
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
        throw new NotFoundException(
          `Event with ID ${id} not found or access denied`,
        );
      }

      this.logger.log(
        `User ${currentUserId || 'anonymous'} accessed event ${id} (private: ${event.isPrivate})`,
      );

      // Map event to GraphQL format with additional fields
      return this.mapToDto(event as Event, currentUserId, authToken);
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
    authToken?: string,
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

      return await Promise.all(
        invitations.map(async (invitation) => {
          const invitationDto = plainToClass(EventInvitationDto, invitation);

          if (invitation.event.images && authToken) {
            const url = await this.storageService.getSignedUrl(
              invitation.event.images[0],
              3600,
              authToken,
            );
            const { isCensored } =
              await this.imageCensorFilterService.checkImageCensorContent(url);
            invitationDto.event.images = [{ url: url, isCensored }];
          }

          return invitationDto;
        }),
      );
    } catch (error) {
      this.logger.error('Error finding invitations:', error);
      throw new BadRequestException('Failed to fetch invitations');
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

      // Process uploaded images if they exist
      let processedImages: string[] | undefined;
      if (images && images.length > 0) {
        processedImages = (
          await Promise.all(
            images.map((image, index) =>
              this.processImageUpload(
                image,
                'events/images',
                `event-${userId}-${index}`,
                authToken,
              ),
            ),
          )
        ).filter(Boolean) as string[];
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

      return this.mapToDto(event, userId, authToken);
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

      // Process uploaded images if they exist
      let processedImages: string[] | undefined;
      if (images && images.length > 0) {
        processedImages = (
          await Promise.all(
            images.map(async (image, index) => {
              const imageUrl = await this.processImageUpload(
                image,
                'events/images',
                `event-${userId}-${index}`,
                authToken,
              );

              if (imageUrl && imageUrl.startsWith('events/images')) {
                return imageUrl;
              }

              const imageUrlWithoutQuery = imageUrl?.split('?')[0];
              return `events/images/${imageUrlWithoutQuery?.split('/').pop()}`;
            }),
          )
        ).filter(Boolean);
      }

      // First get the current event to handle relationships properly
      const currentEvent = await this.prisma.event.findFirst({
        where: { id, isActive: true },
        include: {
          invitedGroups: true,
          invitations: true,
        },
      });

      if (!currentEvent) {
        throw new NotFoundException(`Event with id ${id} not found`);
      }

      // Use transaction to ensure atomicity
      const event = await this.prisma.$transaction(async (tx) => {
        // Update the event
        const updatedEvent = await tx.event.update({
          where: { id, isActive: true },
          data: {
            title,
            description,
            eventType,
            status,
            startDateTime,
            endDateTime,
            maxParticipants,
            isPrivate,
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
            organizedByGroupId: organizedByGroupId || null,
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
            // Always remove all existing invited groups and add new ones
            invitedGroups: {
              disconnect: currentEvent.invitedGroups?.map((group) => ({
                id: group.id,
              })) as { id: string }[],
              ...(invitedGroupIds?.length
                ? { connect: invitedGroupIds.map((id) => ({ id })) }
                : {}),
            },
            // Always remove all existing invitations and add new ones
            invitations: {
              updateMany: {
                where: {
                  eventId: id,
                  isActive: true,
                },
                data: {
                  isActive: false,
                },
              },
              ...(invitedUserIds?.length
                ? {
                    createMany: {
                      data: invitedUserIds.map((inviteeId) => ({
                        inviteeId: inviteeId,
                        createdById: userId,
                      })),
                    },
                  }
                : {}),
            },
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
      });

      return this.mapToDto(event as Event, userId, authToken);
    } catch (error) {
      this.logger.error(`Failed to update event`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const event = await this.prisma.event.update({
        where: { id, isActive: true },
        data: {
          isActive: false,
          updatedBy: { connect: { id: userId } },
          updatedAt: new Date(),
        },
        include: {
          createdBy: true,
          updatedBy: true,
          participants: true,
          addresses: true,
          invitedGroups: true,
        },
      });

      return event.isActive === false;
    } catch (error) {
      this.logger.error(`Failed to remove event`, error);
      throw error;
    }
  }

  async join(
    eventId: string,
    userId: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, isActive: true, status: EventStatus.UPCOMING },
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${eventId} not found`);
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

      return await this.findOne(eventId, userId, authToken);
    } catch (error) {
      this.logger.error(`Failed to join event`, error);
      throw error;
    }
  }

  async leave(
    eventId: string,
    userId: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      const event = await this.prisma.event.findFirst({
        where: { id: eventId, isActive: true, status: EventStatus.UPCOMING },
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${eventId} not found`);
      }
      const participant = await this.prisma.eventParticipant.findFirst({
        where: {
          eventId,
          createdById: userId,
        },
      });

      if (!participant) {
        throw new NotFoundException('Participant not found');
      }

      await this.prisma.eventParticipant.update({
        where: { id: participant.id },
        data: {
          status: EventParticipantStatus.LEFT,
          updatedBy: { connect: { id: userId } },
          updatedAt: new Date(),
        },
      });

      return await this.findOne(eventId, userId, authToken);
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
        throw new NotFoundException('Invitation not found');
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
      if (error instanceof NotFoundException) {
        throw error;
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
        throw new NotFoundException('Invitation not found');
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
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw new BadRequestException('Failed to reject invitation');
    }
  }

  // Helper method to map Prisma event to DTO with additional calculated fields
  private async mapToDto(
    event: {
      id: string;
      title: string;
      description?: string;
      images?: string[];
      participants?: EventParticipant[];
      createdById: string;
      [key: string]: any;
    },
    currentUserId?: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      // Process images to get signed URLs and check for censored content
      const images: ImageDto[] = [];

      if (Array.isArray(event.images) && event.images.length > 0 && authToken) {
        try {
          await Promise.all(
            event.images.map(async (imageUrl) => {
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

      // Process participants to get signed URLs if needed
      let processedParticipants = event.participants || [];

      if (
        Array.isArray(processedParticipants) &&
        processedParticipants.length > 0 &&
        authToken
      ) {
        try {
          processedParticipants = await Promise.all(
            processedParticipants.map(async (participant) => {
              if (
                participant.createdBy.avatar &&
                typeof participant.createdBy.avatar === 'string'
              ) {
                const signedUrl = await this.storageService.getSignedUrl(
                  participant.createdBy.avatar,
                  3600,
                  authToken,
                );
                return {
                  ...participant,
                  createdBy: {
                    ...participant.createdBy,
                    avatar: signedUrl,
                  },
                };
              }
              return participant;
            }),
          );
        } catch (error) {
          const errorMessage =
            error instanceof Error ? error.message : 'Unknown error';
          console.error('Error getting signed URLs:', errorMessage);
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
        participants: processedParticipants,
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
}
