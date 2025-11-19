import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { addDays } from 'date-fns';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../queue/queue.service';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationChannel } from '../../enums/models/notification-channel.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { EventStatus } from '../../enums/models/event-status.enum';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';
import { Event } from '../../events/models/event.model';

/**
 * Service responsible for sending event reminder notifications
 * Handles invitation reminders and event start reminders (3-day, 1-day)
 */
@Injectable()
export class EventReminderJobService {
  private readonly logger = new Logger(EventReminderJobService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly queueService: QueueService,
  ) {}

  /**
   * Cron job that runs every day at 10:00 AM to send reminder notifications
   * - Sends invitation reminders for pending invitations
   * - Sends event start reminders (3 days, 1 day before)
   */
  @Cron(CronExpression.EVERY_DAY_AT_10AM) // Every day at 10:00 AM
  async sendEventReminders(): Promise<void> {
    try {
      this.logger.log('Starting event reminder job...');

      await Promise.all([
        this.sendInvitationReminders(),
        this.sendEventStartReminders(),
      ]);

      this.logger.log('Event reminder job completed successfully');
    } catch (error) {
      this.logger.error('Failed to send event reminders', error);
      throw error;
    }
  }

  /**
   * Send reminder notifications to users with pending event invitations
   * Reminds users who haven't responded to invitations for upcoming events
   */
  private async sendInvitationReminders(): Promise<void> {
    try {
      this.logger.log('Sending invitation reminders...');

      const now = new Date();
      const threeDaysFromNow = addDays(now, 3);

      // Find pending invitations for upcoming events starting within 3 days
      const pendingInvitations = await this.prisma.eventInvitation.findMany({
        where: {
          status: ApprovalStatus.PENDING,
          isActive: true,
          event: {
            status: EventStatus.UPCOMING,
            isActive: true,
            startDateTime: {
              gt: now,
              lte: threeDaysFromNow,
            },
          },
        },
        include: {
          event: {
            select: {
              id: true,
              title: true,
              startDateTime: true,
            },
          },
          invitee: {
            select: {
              id: true,
            },
          },
          createdBy: {
            select: {
              id: true,
            },
          },
        },
      });

      if (pendingInvitations.length === 0) {
        this.logger.log('No pending invitations found for reminder');
        return;
      }

      this.logger.log(
        `Found ${pendingInvitations.length} pending invitations to remind`,
      );

      // Send reminder notifications
      for (const invitation of pendingInvitations) {
        await this.queueService.addNotificationJob(
          {
            title: 'event.invitation_reminder.title',
            body: 'event.invitation_reminder.body',
            type: NotificationType.EVENT_INVITATION_REMINDER,
            channel: NotificationChannel.PUSH,
            userId: invitation.invitee.id,
            data: {
              eventName: invitation.event.title,
              eventDate: invitation.event.startDateTime,
            } as Record<string, any>,
          },
          invitation.createdBy.id,
        );
      }

      this.logger.log(
        `Successfully queued ${pendingInvitations.length} invitation reminder notifications`,
      );
    } catch (error) {
      this.logger.error('Failed to send invitation reminders', error);
      throw error;
    }
  }
  /**
   * Send 3-day reminder notifications
   */
  private async sendEventStartReminders(): Promise<void> {
    const now = new Date();
    const threeDaysFromNow = addDays(now, 3);

    const events = await this.getEventsForReminder(now, threeDaysFromNow);

    for (const event of events) {
      await this.sendEventReminderToParticipants(
        event,
        NotificationType.EVENT_REMINDER,
      );
    }

    this.logger.log(`Sent 3-day reminders for ${events.length} events`);
  }

  /**
   * Get events that need reminders within the specified time range
   */
  private async getEventsForReminder(
    startTime: Date,
    endTime: Date,
  ): Promise<Event[]> {
    return (await this.prisma.event.findMany({
      where: {
        status: EventStatus.UPCOMING,
        isActive: true,
        startDateTime: {
          gt: startTime,
          lte: endTime,
        },
      },
      include: {
        participants: {
          where: {
            status: EventParticipantStatus.JOINED,
            isActive: true,
          },
          include: {
            createdBy: {
              select: {
                id: true,
              },
            },
          },
        },
      },
    })) as Event[];
  }

  /**
   * Send reminder notifications to all participants of an event
   */
  private async sendEventReminderToParticipants(
    event: Event,
    notificationType: NotificationType,
  ): Promise<void> {
    for (const participant of event.participants || []) {
      if (!participant.createdBy.id) {
        continue;
      }

      await this.queueService.addNotificationJob(
        {
          title: 'event.reminder.title',
          body: 'event.reminder.body',
          type: notificationType,
          channel: NotificationChannel.PUSH,
          userId: participant.createdBy?.id,
          data: {
            eventId: event.id,
            eventName: event.title,
            timeUntil: event.startDateTime,
          } as Record<string, any>,
        },
        event.createdById,
      );
    }

    this.logger.log(
      `Sent ${notificationType} reminder to ${event.participants?.length} participants for event: ${event.title}`,
    );
  }

  /**
   * Manual method to trigger event reminders
   * Can be called from other services if needed
   */
  async triggerEventReminders(): Promise<{
    invitationReminders: number;
    threeDayReminders: number;
    oneDayReminders: number;
  }> {
    try {
      this.logger.log('Manual trigger for event reminders');

      const results = {
        invitationReminders: 0,
        threeDayReminders: 0,
        oneDayReminders: 0,
      };

      // Count pending invitations
      const now = new Date();
      const threeDaysFromNow = addDays(now, 3);

      results.invitationReminders = await this.prisma.eventInvitation.count({
        where: {
          status: ApprovalStatus.PENDING,
          isActive: true,
          event: {
            status: EventStatus.UPCOMING,
            isActive: true,
            startDateTime: {
              gte: now,
              lte: threeDaysFromNow,
            },
          },
        },
      });

      // Count 3-day reminder events
      const threeDaysFromNowEnd = addDays(threeDaysFromNow, 1);
      results.threeDayReminders = await this.prisma.event.count({
        where: {
          status: EventStatus.UPCOMING,
          isActive: true,
          startDateTime: {
            gte: threeDaysFromNow,
            lt: threeDaysFromNowEnd,
          },
        },
      });

      // Count 1-day reminder events
      const oneDayFromNow = addDays(now, 1);
      const oneDayFromNowEnd = addDays(oneDayFromNow, 1);
      results.oneDayReminders = await this.prisma.event.count({
        where: {
          status: EventStatus.UPCOMING,
          isActive: true,
          startDateTime: {
            gte: oneDayFromNow,
            lt: oneDayFromNowEnd,
          },
        },
      });

      await this.sendEventReminders();

      return results;
    } catch (error) {
      this.logger.error('Failed to manually trigger event reminders', error);
      throw error;
    }
  }
}
