import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Event } from './models/event.model';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventFilterInput } from './dto/event-filter.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { EventParticipant } from './models/event-participant.model';
import { Request } from 'express';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => Event)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Event)
  async createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.create(createEventInput, userId, authToken);
  }

  @Query(() => [Event], { name: 'events' })
  async findAll(
    @Args('filters', { nullable: true }) filters?: EventFilterInput,
    @Context() context: GqlContext,
  ) {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.findAll(filters, authToken);
  }

  @Query(() => Event, { name: 'event' })
  async findOne(
    @Args('id', { type: () => String }) id: string,
    @Context() context: GqlContext,
  ) {
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.findOne(id, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Event)
  async updateEvent(
    @Args('id') id: string,
    @Args('updateEventInput') updateEventInput: UpdateEventInput,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.update(id, updateEventInput, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Event)
  async removeEvent(@Args('id') id: string, @Context() context: GqlContext) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.remove(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventParticipant)
  async joinEvent(
    @Args('eventId') eventId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.eventsService.joinEvent(eventId, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventParticipant)
  async leaveEvent(
    @Args('eventId') eventId: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.eventsService.leaveEvent(eventId, userId);
  }

  @UseGuards(JwtGuard)
  @Query(() => [Event], { name: 'upcomingEvents' })
  async getUpcomingEvents(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    return this.eventsService.getUpcomingEvents(userId);
  }
}
