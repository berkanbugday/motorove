import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSupportRequestInput } from './dto/create-support-request.input';
import { SupportRequest } from './models/support-request.model';

@Injectable()
export class SupportService {
  private readonly logger = new Logger(SupportService.name);
  constructor(private prisma: PrismaService) {}

  async createSupportRequest(
    input: CreateSupportRequestInput,
    userId: string,
  ): Promise<boolean> {
    try {
      const supportRequest = (await this.prisma.supportRequest.create({
        data: {
          category: input.category,
          subject: input.subject,
          message: input.message,
          deviceInfo: input.deviceInfo,
          createdById: userId,
        },
      })) as SupportRequest;

      this.logger.log(`Support request created: ${supportRequest.id}`);

      return !!supportRequest.id;
    } catch (error) {
      this.logger.error(`Failed to create support request`, error);
      throw error;
    }
  }
}
