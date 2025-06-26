import { Injectable, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { StorageService } from '../core/storage/storage.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventFilterInput } from './dto/event-filter.input';
import { RoadType } from '../enums/models/road-type.enum';
import { DifficultyLevel } from '../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../enums/models/experience-level.enum';
import { InvitationStatus } from '../enums/models/invitation-status.enum';
import { EventParticipantStatus } from '../enums/models/event-participant-status.enum';

@Injectable()
export class EventsService {
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

  async create(
    createEventInput: CreateEventInput,
    userId: string,
    authToken?: string,
  ) {
    const {
      title,
      description,
      eventType,
      startDateTime,
      endDateTime,
      maxParticipants,
      isPrivate,
      images,
      addresses,
      invitedGroupIds,
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
    } = createEventInput;

    // Process uploaded images if they exist
    let processedImages: string[] = [];
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
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
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
        group: invitedGroupIds?.[0]
          ? { connect: { id: invitedGroupIds[0] } }
          : undefined,
      },
      include: {
        createdBy: true,
        group: true,
        addresses: true,
      },
    });

    return event;
  }

  // Process image URLs to get signed URLs if needed
  private async processImageUrls(
    imageUrls: string[] | null | undefined,
    authToken?: string,
  ): Promise<string[]> {
    if (!imageUrls || !Array.isArray(imageUrls) || imageUrls.length === 0) {
      return [];
    }

    if (!authToken) {
      return imageUrls;
    }

    try {
      return await Promise.all(
        imageUrls.map(async (imageUrl) => {
          if (imageUrl && typeof imageUrl === 'string') {
            return await this.storageService.getSignedUrl(
              imageUrl,
              60, // 60 seconds expiry
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
      return imageUrls;
    }
  }

  // Map Prisma event to GraphQL event with additional calculated fields
  private async mapPrismaEventToGraphQLEvent(
    prismaEvent: any,
    currentUserId?: string,
    authToken?: string,
  ): Promise<any> {
    // Process images to get signed URLs if needed
    let processedImages = prismaEvent.images || [];

    if (
      Array.isArray(processedImages) &&
      processedImages.length > 0 &&
      authToken
    ) {
      try {
        processedImages = await this.processImageUrls(
          processedImages,
          authToken,
        );
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : 'Unknown error';
        console.error('Error processing event images:', errorMessage);
      }
    }

    // Calculate if current user is participating
    let isParticipating = false;
    let participationStatus = null;

    if (currentUserId) {
      const participation = prismaEvent.participants?.find(
        (p: any) => p.userId === currentUserId,
      );

      isParticipating = !!participation;
      participationStatus = participation?.status || null;
    }

    // Calculate number of participants
    const participantsCount =
      prismaEvent.participants?.filter(
        (p: any) => p.status === EventParticipantStatus.JOINED,
      ).length || 0;

    return {
      ...prismaEvent,
      images: processedImages,
      isParticipating,
      participationStatus,
      participantsCount,
    };
  }

  async findAll(
    filters?: EventFilterInput,
    currentUserId?: string,
    authToken?: string,
  ) {
    const where = this.buildFilterQuery(filters);

    const events = await this.prisma.event.findMany({
      where,
      include: {
        createdBy: true,
        group: true,
        participants: true,
        addresses: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });

    // Map events to GraphQL format with additional fields
    const mappedEvents = await Promise.all(
      events.map((event) =>
        this.mapPrismaEventToGraphQLEvent(event, currentUserId, authToken),
      ),
    );

    return mappedEvents;
  }

  async findOne(id: string, currentUserId?: string, authToken?: string) {
    const event = await this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: true,
        group: true,
        participants: true,
        addresses: true,
        invitations: {
          include: {
            invitee: true,
          },
        },
      },
    });

    if (!event) {
      return null;
    }

    // Map event to GraphQL format with additional fields
    return this.mapPrismaEventToGraphQLEvent(event, currentUserId, authToken);
  }

  async update(
    id: string,
    updateEventInput: UpdateEventInput,
    userId: string,
    authToken?: string,
  ) {
    const {
      title,
      description,
      eventType,
      startDateTime,
      endDateTime,
      maxParticipants,
      isPrivate,
      images,
      addresses,
      invitedGroupIds,
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
    } = updateEventInput;

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

    return this.prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        eventType,
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
        updatedBy: { connect: { id: userId } },
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
        // Handle group update if invitedGroupIds provided
        group: invitedGroupIds?.[0]
          ? { connect: { id: invitedGroupIds[0] } }
          : undefined,
      },
      include: {
        createdBy: true,
        group: true,
        addresses: true,
        participants: true,
      },
    });
  }

  async remove(id: string) {
    return this.prisma.event.update({
      where: { id },
      data: {
        isActive: false,
      },
    });
  }

  async joinEvent(eventId: string, userId: string) {
    return this.prisma.eventParticipant.create({
      data: {
        event: { connect: { id: eventId } },
        user: { connect: { id: userId } },
        status: EventParticipantStatus.JOINED,
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async leaveEvent(eventId: string, userId: string) {
    const participant = await this.prisma.eventParticipant.findFirst({
      where: {
        eventId,
        userId,
      },
    });

    if (!participant) {
      throw new Error('Participant not found');
    }

    return this.prisma.eventParticipant.update({
      where: { id: participant.id },
      data: {
        status: EventParticipantStatus.LEFT,
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async getUpcomingEvents(userId: string, authToken?: string) {
    const now = new Date();

    const events = await this.prisma.event.findMany({
      where: {
        startDateTime: {
          gte: now,
        },
        OR: [
          {
            isPrivate: false,
          },
          {
            participants: {
              some: {
                userId,
              },
            },
          },
          {
            createdById: userId,
          },
          {
            invitations: {
              some: {
                inviteeId: userId,
              },
            },
          },
          {
            groupId: {
              not: null,
            },
            group: {
              memberships: {
                some: {
                  userId,
                  status: InvitationStatus.ACCEPTED,
                },
              },
            },
          },
        ],
        isActive: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
      include: {
        createdBy: true,
        group: true,
        participants: {
          include: {
            user: true,
          },
        },
        addresses: true,
      },
    });

    // Map events to GraphQL format with additional fields
    const mappedEvents = await Promise.all(
      events.map((event) =>
        this.mapPrismaEventToGraphQLEvent(event, userId, authToken),
      ),
    );

    return mappedEvents;
  }

  // Helper method to build the filter query
  private buildFilterQuery(filters?: EventFilterInput) {
    if (!filters) return { isActive: true };

    const {
      eventType,
      startDateFrom,
      startDateTo,
      searchTerm,
      difficultyLevel,
      experienceLevel,
      roadType,
      groupId,
      createdById,
      isPrivate,
      language,
    } = filters;

    const where: any = { isActive: true };

    if (eventType) {
      where.eventType = eventType;
    }

    if (startDateFrom || startDateTo) {
      where.startDateTime = {};
      if (startDateFrom) {
        where.startDateTime.gte = startDateFrom;
      }
      if (startDateTo) {
        where.startDateTime.lte = startDateTo;
      }
    }

    if (searchTerm) {
      where.OR = [
        { title: { contains: searchTerm, mode: 'insensitive' } },
        { description: { contains: searchTerm, mode: 'insensitive' } },
      ];
    }

    if (difficultyLevel) {
      where.difficultyLevel = difficultyLevel;
    }

    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    if (roadType) {
      where.roadType = roadType;
    }

    if (groupId) {
      where.groupId = groupId;
    }

    if (createdById) {
      where.createdById = createdById;
    }

    if (isPrivate !== undefined) {
      where.isPrivate = isPrivate;
    }

    if (language) {
      where.addresses = {
        some: {
          language,
        },
      };
    }

    return where;
  }
}
