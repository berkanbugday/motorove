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

@Injectable()
export class EventsService {
  private readonly logger = new Logger(EventsService.name);
  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async findAll(
    limit?: number,
    skip?: number,
    currentUserId?: string,
    authToken?: string,
    status?: EventStatus,
  ): Promise<EventDto[]> {
    try {
      const where = {
        isActive: true,
        ...(status && { status }),
        ...(status === EventStatus.DRAFT &&
          currentUserId && { createdById: currentUserId }),
      };

      const events = await this.prisma.event.findMany({
        where,
        include: {
          createdBy: true,
          updatedBy: true,
          organizedByGroup: true,
          participants: true,
          addresses: true,
          invitedGroups: true,
        },
        orderBy: {
          startDateTime: 'asc',
        },
        take: limit || undefined,
        skip: skip || undefined,
      });

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
      const event = await this.prisma.event.findFirst({
        where: { id, isActive: true },
        include: {
          createdBy: true,
          updatedBy: true,
          organizedByGroup: true,
          participants: true,
          addresses: true,
          invitedGroups: true,
          invitations: {
            include: {
              invitee: true,
            },
          },
        },
      });

      if (!event || !event.isActive) {
        throw new NotFoundException(`Event with ID ${id} not found`);
      }

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
              organizedByGroup: true,
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

      if (invitations.length > 0) {
        await Promise.all(
          invitations.map(async (invitation) => {
            if (invitation.event.images && authToken) {
              try {
                invitation.event.images[0] =
                  await this.storageService.getSignedUrl(
                    invitation.event.images[0],
                    3600,
                    authToken,
                  );
              } catch (error) {
                this.logger.error(
                  `Error getting signed URL for avatar: ${error.message}`,
                );
              }
            }
          }),
        );
      }

      return await Promise.all(
        invitations.map((invitation) =>
          plainToClass(EventInvitationDto, invitation),
        ),
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

      const event = await this.prisma.event.create({
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
          organizedByGroup: true,
          addresses: true,
          invitedGroups: true,
          invitations: {
            include: {
              invitee: true,
            },
          },
        },
      });

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

      const event = await this.prisma.event.update({
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
                    latitude: addr.latitude,
                    longitude: addr.longitude,
                  })),
                },
              }
            : undefined,
          // Handle invited groups if provided
          invitedGroups: invitedGroupIds?.length
            ? {
                disconnect: currentEvent.invitedGroups?.map((group) => ({
                  id: group.id,
                })) as { id: string }[],
                connect: invitedGroupIds.map((id) => ({ id })),
              }
            : undefined,
          // Handle invited users through invitations if provided
          invitations: invitedUserIds?.length
            ? {
                deleteMany: {
                  eventId: id,
                },
                createMany: {
                  data: invitedUserIds.map((inviteeId) => ({
                    inviteeId: inviteeId,
                    inviterId: userId, // The user updating the event
                    createdById: userId,
                  })),
                },
              }
            : undefined,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          organizedByGroup: true,
          addresses: true,
          participants: true,
          invitedGroups: true,
          invitations: {
            include: {
              invitee: true,
            },
          },
        },
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
        where: { id: eventId, isActive: true },
      });

      if (!event) {
        throw new NotFoundException(`Event with id ${eventId} not found`);
      }

      const participant = await this.prisma.eventParticipant.create({
        data: {
          event: { connect: { id: eventId } },
          createdBy: { connect: { id: userId } },
          status: EventParticipantStatus.JOINED,
        },
        include: {
          event: true,
          createdBy: true,
        },
      });

      return this.mapToDto(participant.event, userId, authToken);
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
        where: { id: eventId, isActive: true },
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
        },
      });

      const eventDto = await this.findOne(eventId, userId, authToken);

      return eventDto;
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
      participants?: Array<{
        id: string;
        createdById: string;
        status: EventParticipantStatus;
      }>;
      createdById: string;
      [key: string]: any;
    },
    currentUserId?: string,
    authToken?: string,
  ): Promise<EventDto> {
    try {
      // Process images to get signed URLs if needed
      let processedImages = event.images || [];

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
                  3600,
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

      // Create base DTO with transformed data
      const eventWithExtras = {
        ...event,
        images: processedImages,
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
