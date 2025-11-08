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
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { Request } from 'express';
import { EventDto } from './dto/event.dto';
import { EventStatus } from '../enums/models/event-status.enum';
import { EventInvitationDto } from './dto/event-invitation.dto';

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
    @Args('status', { type: () => EventStatus, nullable: true })
    status?: EventStatus,
    @Args('groupId', { type: () => String, nullable: true })
    groupId?: string,
  ): Promise<EventDto[]> {
    const userId = context.req.user?.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.eventsService.findAll(
      limit,
      skip,
      userId,
      authToken,
      status,
      groupId,
    );
  }

  @UseGuards(JwtGuard)
  @Query(() => EventDto, { name: 'event' })
  async findOne(
    @Args('id') id: string,
    @Context() context: GqlContext,
  ): Promise<EventDto> {
    const authHeader = context.req.headers.authorization;
    const userId = context.req.user?.id;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.eventsService.findOne(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Query(() => [EventInvitationDto], { name: 'eventInvitations' })
  async findAllInvitations(
    @Context() context: GqlContext,
    @Args('limit', { type: () => Int, nullable: true }) limit?: number,
    @Args('skip', { type: () => Int, nullable: true }) skip?: number,
  ): Promise<EventInvitationDto[]> {
    const authHeader = context.req.headers.authorization;
    const userId = context.req.user?.id;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    const invitations = await this.eventsService.findAllInvitations(
      limit,
      skip,
      userId,
      authToken,
    );
    return invitations;
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

    return await this.eventsService.create(input, userId, authToken);
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

    return await this.eventsService.update(input, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => String)
  async removeEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<string> {
    const userId = context.req.user.id;
    return await this.eventsService.remove(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => String)
  async cancelEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<string> {
    const userId = context.req.user.id;
    return await this.eventsService.cancel(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async joinEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<EventDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.eventsService.join(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => EventDto)
  async leaveEvent(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<EventDto> {
    const userId = context.req.user.id;
    const authHeader = context.req.headers.authorization;
    const authToken = authHeader ? authHeader.split(' ')[1] : undefined;
    return await this.eventsService.leave(id, userId, authToken);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async acceptEventInvitation(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return await this.eventsService.acceptInvitation(id, userId);
  }

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async rejectEventInvitation(
    @Args('id', { type: () => ID }) id: string,
    @Context() context: GqlContext,
  ): Promise<boolean> {
    const userId = context.req.user.id;
    return await this.eventsService.rejectInvitation(id, userId);
  }
}
