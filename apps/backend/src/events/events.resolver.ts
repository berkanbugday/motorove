import {
  Resolver,
  Query,
  Mutation,
  Args,
  Context,
  ID,
  Int,
} from '@nestjs/graphql';
import { EventsService } from './events.service';
import { CreateEventInput } from './dto/create-event.input';
import { UpdateEventInput } from './dto/update-event.input';
import { FilterEventInput } from './dto/filter-event.input';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { EventDto } from './dto/event.dto';

interface GqlContext {
  req: Request & {
    user: { id: string };
    headers: { authorization?: string };
  };
}

@Resolver(() => EventDto)
export class EventsResolver {
  constructor(private readonly eventsService: EventsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [EventDto], { name: 'events' })
  async findAll(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
    @Args('filters', { type: () => FilterEventInput, nullable: true })
    filters?: FilterEventInput,
  ) {
    const userId = context.req.user?.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.findAll(limit, skip, filters, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => EventDto, { name: 'event' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const authHeader = context.req.headers.authorization;
    const userId = context.req.user?.id;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async createEvent(
    @Args('input') input: CreateEventInput,
    @Context() context: GqlContext,
  ): Promise<EventDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.eventsService.create(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async updateEvent(
    @Args('input') input: UpdateEventInput,
    @Context() context: GqlContext,
  ): Promise<EventDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;

    return this.eventsService.update(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async removeEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    return this.eventsService.remove(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async joinEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.join(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async leaveEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.leave(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => [EventDto])
  async upcomingEvents(@Context() context: GqlContext) {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return this.eventsService.findUpcomingEvents(userId, authToken);
  }
}
