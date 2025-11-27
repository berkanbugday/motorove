import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { CreateContentReportInput } from './dto/create-content-report.input';
import { ReportStatus } from '../enums/models/report-status.enum';

@Injectable()
export class ContentReportsService {
  private readonly logger = new Logger(ContentReportsService.name);

  constructor(private prisma: PrismaService) {}

  /**
   * Create a content report
   */
  async createReport(
    input: CreateContentReportInput,
    createdById: string,
  ): Promise<boolean> {
    try {
      // Check if user already reported this content
      const existingReport = await this.prisma.contentReport.findFirst({
        where: {
          AND: [
            { createdById },
            { contentType: input.contentType },
            { contentId: input.contentId },
          ],
        },
      });

      if (existingReport) {
        ExceptionHelper.conflict('errors.content_reports.already_reported');
      }

      // Create the report
      const report = await this.prisma.contentReport.create({
        data: {
          contentType: input.contentType,
          contentId: input.contentId,
          reason: input.reason,
          description: input.description,
          createdById,
          status: ReportStatus.PENDING,
        },
        select: {
          id: true,
        },
      });

      this.logger.log(
        `Content report created: ${report.id} for ${input.contentType}:${input.contentId}`,
      );

      return !!report.id;
    } catch (error: any) {
      this.logger.error(
        `Failed to create content report: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }
}
