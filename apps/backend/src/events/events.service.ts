import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventFilterInput } from './dto/event-filter.input';
import { RoadType } from '../enums/models/road-type.enum';
import { DifficultyLevel } from '../enums/models/difficulty-level.enum';
import { ExperienceLevel } from '../enums/models/experience-level.enum';
import { InvitationStatus } from '../enums/models/invitation-status.enum';

@Injectable()
export class EventsService {
  constructor(private prisma: PrismaService) {}

  async create(createEventInput: CreateEventInput, userId: string) {
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

    const event = await this.prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startDateTime,
        endDateTime,
        maxParticipants,
        isPrivate,
        images,
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

  async findAll(filters?: EventFilterInput) {
    const where = this.buildFilterQuery(filters);

    return this.prisma.event.findMany({
      where,
      include: {
        createdBy: true,
        group: true,
        participants: true,
      },
      orderBy: {
        startDateTime: 'asc',
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.event.findUnique({
      where: { id },
      include: {
        createdBy: true,
        group: true,
        participants: true,
        invitations: {
          include: {
            invitee: true,
          },
        },
      },
    });
  }

  async update(id: string, updateEventInput: UpdateEventInput, userId: string) {
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
        images,
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
        status: 'JOINED',
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
        status: 'LEFT',
      },
      include: {
        event: true,
        user: true,
      },
    });
  }

  async getUpcomingEvents(userId: string) {
    const now = new Date();

    return this.prisma.event.findMany({
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
      },
    });
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
