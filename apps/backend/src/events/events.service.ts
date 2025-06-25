import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventFilterInput } from './dto/event-filter.input';

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
      meetingPoint,
      startLocation,
      finishLocation,
      maxParticipants,
      isPrivate,
      images,
      groupId,
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
      meetingPointLat,
      meetingPointLng,
      startLocationLat,
      startLocationLng,
      finishLocationLat,
      finishLocationLng,
    } = createEventInput;

    return this.prisma.event.create({
      data: {
        title,
        description,
        eventType,
        startDateTime,
        endDateTime,
        meetingPoint,
        startLocation,
        finishLocation,
        maxParticipants,
        isPrivate,
        images,
        roadType,
        difficultyLevel,
        routeDescription,
        restStops,
        campingInfo,
        equipmentChecklist,
        instructorInfo,
        topicsCovered,
        experienceLevel,
        price: price ? parseFloat(price) : null,
        meetingPointLat,
        meetingPointLng,
        startLocationLat,
        startLocationLng,
        finishLocationLat,
        finishLocationLng,
        createdBy: { connect: { id: userId } },
        updatedBy: { connect: { id: userId } },
        group: groupId ? { connect: { id: groupId } } : undefined,
      },
      include: {
        createdBy: true,
        group: true,
      },
    });
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
      meetingPoint,
      startLocation,
      finishLocation,
      maxParticipants,
      isPrivate,
      images,
      groupId,
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
      meetingPointLat,
      meetingPointLng,
      startLocationLat,
      startLocationLng,
      finishLocationLat,
      finishLocationLng,
    } = updateEventInput;

    return this.prisma.event.update({
      where: { id },
      data: {
        title,
        description,
        eventType,
        startDateTime,
        endDateTime,
        meetingPoint,
        startLocation,
        finishLocation,
        maxParticipants,
        isPrivate,
        images,
        roadType,
        difficultyLevel,
        routeDescription,
        restStops,
        campingInfo,
        equipmentChecklist,
        instructorInfo,
        topicsCovered,
        experienceLevel,
        price: price ? parseFloat(price) : null,
        meetingPointLat,
        meetingPointLng,
        startLocationLat,
        startLocationLng,
        finishLocationLat,
        finishLocationLng,
        updatedBy: { connect: { id: userId } },
        updatedAt: new Date(),
        group: groupId ? { connect: { id: groupId } } : { disconnect: true },
      },
      include: {
        createdBy: true,
        group: true,
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
                  status: 'APPROVED',
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

    return where;
  }
}
