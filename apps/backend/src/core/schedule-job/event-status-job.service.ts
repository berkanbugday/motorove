import { Injectable, Logger } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from '../../prisma/prisma.service';
import { EventStatus } from '../../enums/models/event-status.enum';

/**
 * Service responsible for updating event statuses
 * Automatically updates events from UPCOMING to PAST when their start time has passed
 */
@Injectable()
export class EventStatusJobService {
  private readonly logger = new Logger(EventStatusJobService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Cron job that runs every hour to check and update event statuses
   * Updates events from UPCOMING to PAST if their start datetime has passed
   */
  @Cron(CronExpression.EVERY_HOUR)
  async updatePastEvents(): Promise<void> {
    try {
      this.logger.log('Starting event status update job...');

      const now = new Date();

      // Find all UPCOMING events where startDateTime is in the past
      const eventsToUpdate = await this.prisma.event.findMany({
        where: {
          status: EventStatus.UPCOMING,
          startDateTime: {
            lt: now,
          },
          isActive: true,
        },
        select: {
          id: true,
          title: true,
          startDateTime: true,
        },
      });

      if (eventsToUpdate.length === 0) {
        this.logger.log('No events to update');
        return;
      }

      this.logger.log(
        `Found ${eventsToUpdate.length} events to update to PAST status`,
      );

      const eventIds = eventsToUpdate.map((event) => event.id);

      // Use transaction to ensure data consistency
      const result = await this.prisma.$transaction(async (tx) => {
        // Update all found events to PAST status
        const updateResult = await tx.event.updateMany({
          where: {
            id: {
              in: eventIds,
            },
          },
          data: {
            status: EventStatus.PAST,
            updatedAt: now,
          },
        });

        // Deactivate related event invitations
        await tx.eventInvitation.updateMany({
          where: {
            eventId: {
              in: eventIds,
            },
            isActive: true,
          },
          data: {
            isActive: false,
            updatedAt: now,
          },
        });

        return updateResult;
      });

      this.logger.log(
        `Successfully updated ${result.count} events to PAST status`,
      );

      // Log details of updated events
      eventsToUpdate.forEach((event) => {
        this.logger.log(
          `Updated event: ${event.title} (ID: ${event.id}) - Started: ${event.startDateTime.toISOString()}`,
        );
      });
    } catch (error) {
      this.logger.error('Failed to update event statuses', error);
      throw error;
    }
  }

  /**
   * Manual method to trigger event status update
   * Can be called from other services if needed
   */
  async triggerEventStatusUpdate(): Promise<number> {
    try {
      this.logger.log('Manual trigger for event status update');
      await this.updatePastEvents();

      // Return count of updated events
      const now = new Date();
      const updatedCount = await this.prisma.event.count({
        where: {
          status: EventStatus.PAST,
          startDateTime: {
            lt: now,
          },
          updatedAt: {
            gte: new Date(now.getTime() - 60000), // Updated in the last minute
          },
          isActive: true,
        },
      });

      return updatedCount;
    } catch (error) {
      this.logger.error(
        'Failed to manually trigger event status update',
        error,
      );
      throw error;
    }
  }
}
