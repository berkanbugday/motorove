import { Resolver, Query, Mutation, Args, Context } from '@nestjs/graphql';
import { EventsService } from './events.service';
import { Event } from './models/event.model';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { EventFilterInput } from './dto/event-filter.input';
import { UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { EventParticipant } from './models/event-participant.model';

@Resolver(() => Event)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async createEvent(
    @Args('createEventInput') createEventInput: CreateEventInput,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.create(createEventInput, user.id);
  }

  @Query(() => [Event], { name: 'events' })
  async findAll(
    @Args('filters', { nullable: true }) filters?: EventFilterInput,
  ) {
    return this.eventsService.findAll(filters);
  }

  @Query(() => Event, { name: 'event' })
  async findOne(@Args('id', { type: () => String }) id: string) {
    return this.eventsService.findOne(id);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async updateEvent(
    @Args('id') id: string,
    @Args('updateEventInput') updateEventInput: UpdateEventInput,
    @CurrentUser() user: any,
  ) {
    return this.eventsService.update(id, updateEventInput, user.id);
  }

  @Mutation(() => Event)
  @UseGuards(JwtAuthGuard)
  async removeEvent(@Args('id') id: string) {
    return this.eventsService.remove(id);
  }

  @Mutation(() => EventParticipant)
  @UseGuards(JwtAuthGuard)
  async joinEvent(@Args('eventId') eventId: string, @CurrentUser() user: any) {
    return this.eventsService.joinEvent(eventId, user.id);
  }

  @Mutation(() => EventParticipant)
  @UseGuards(JwtAuthGuard)
  async leaveEvent(@Args('eventId') eventId: string, @CurrentUser() user: any) {
    return this.eventsService.leaveEvent(eventId, user.id);
  }

  @Query(() => [Event], { name: 'upcomingEvents' })
  @UseGuards(JwtAuthGuard)
  async getUpcomingEvents(@CurrentUser() user: any) {
    return this.eventsService.getUpcomingEvents(user.id);
  }
}
