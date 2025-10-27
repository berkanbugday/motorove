import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCommentInput } from './dto/create-business-comment.input';
import { UpdateBusinessCommentInput } from './dto/update-business-comment.input';
import { BusinessComment } from './models/business-comment.model';
import { BusinessCommentDto } from './dto/business-comment.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class BusinessCommentsService {
  private readonly logger = new Logger(BusinessCommentsService.name);
  constructor(private readonly prisma: PrismaService) {}

  async findAll(
    businessId: string,
    limit?: number,
    skip?: number,
  ): Promise<BusinessCommentDto[]> {
    try {
      const where = {
        businessId,
        isActive: true,
      };

      const businessComments = (await this.prisma.businessComment.findMany({
        where,
        include: {
          createdBy: true,
          updatedBy: true,
          business: {
            include: {
              address: true,
              descriptions: true,
              workingHours: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
        skip: skip || undefined,
        take: limit || undefined,
      })) as BusinessComment[];

      return businessComments.map((comment) => this.mapToDto(comment));
    } catch (error) {
      this.logger.error(
        `Failed to get comments for business ${businessId}`,
        error,
      );
      throw error;
    }
  }

  async findOne(id: string): Promise<BusinessCommentDto> {
    try {
      const businessComment = (await this.prisma.businessComment.findFirst({
        where: { id },
        include: {
          createdBy: true,
          updatedBy: true,
          business: {
            include: {
              address: true,
              descriptions: true,
              workingHours: true,
            },
          },
        },
      })) as BusinessComment;

      if (!businessComment || !businessComment.isActive) {
        throw new NotFoundException(`Business comment with ID ${id} not found`);
      }

      return this.mapToDto(businessComment);
    } catch (error) {
      this.logger.error(`Failed to get business comment with ID ${id}`, error);
      throw error;
    }
  }

  async create(
    input: CreateBusinessCommentInput,
    userId: string,
  ): Promise<BusinessCommentDto> {
    try {
      // Validate rating
      if (input.rating < 1 || input.rating > 5) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      // Check if the business exists and is active
      const business = await this.prisma.business.findFirst({
        where: { id: input.businessId },
      });

      if (!business || !business.isActive) {
        throw new NotFoundException(
          `Business with ID ${input.businessId} not found`,
        );
      }

      // Check if user already commented on this business
      const existingComment = await this.prisma.businessComment.findFirst({
        where: {
          businessId: input.businessId,
          createdById: userId,
          isActive: true,
        },
      });

      if (existingComment) {
        throw new BadRequestException(
          'You have already commented on this business. Please update your existing comment.',
        );
      }

      const businessComment = (await this.prisma.businessComment.create({
        data: {
          content: input.content,
          rating: input.rating,
          businessId: input.businessId,
          createdById: userId,
          updatedById: userId,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          business: {
            include: {
              address: true,
              descriptions: true,
              workingHours: true,
            },
          },
        },
      })) as BusinessComment;

      return this.mapToDto(businessComment);
    } catch (error) {
      this.logger.error(`Failed to create business comment`, error);
      throw error;
    }
  }

  async update(
    input: UpdateBusinessCommentInput,
    userId: string,
  ): Promise<BusinessCommentDto> {
    try {
      // Validate rating if provided
      if (input.rating && (input.rating < 1 || input.rating > 5)) {
        throw new BadRequestException('Rating must be between 1 and 5');
      }

      const businessComment = (await this.prisma.businessComment.findFirst({
        where: { id: input.id },
        include: {
          createdBy: true,
        },
      })) as BusinessComment;

      if (!businessComment || !businessComment.isActive) {
        throw new NotFoundException(
          `Business comment with ID ${input.id} not found`,
        );
      }

      // Check if user is the creator
      if (businessComment.createdById !== userId) {
        throw new ForbiddenException(
          'You do not have permission to update this business comment',
        );
      }

      const updatedBusinessComment = (await this.prisma.businessComment.update({
        where: { id: input.id },
        data: {
          ...input,
          updatedById: userId,
        },
        include: {
          createdBy: true,
          updatedBy: true,
          business: {
            include: {
              address: true,
              descriptions: true,
              workingHours: true,
            },
          },
        },
      })) as BusinessComment;

      return this.mapToDto(updatedBusinessComment);
    } catch (error) {
      this.logger.error(`Failed to update business comment`, error);
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<boolean> {
    try {
      const businessComment = (await this.prisma.businessComment.findFirst({
        where: { id },
        include: {
          createdBy: true,
        },
      })) as BusinessComment;

      if (!businessComment || !businessComment.isActive) {
        throw new NotFoundException(`Business comment with ID ${id} not found`);
      }

      // Check if user is the creator
      if (businessComment.createdById !== userId) {
        throw new ForbiddenException(
          'You do not have permission to delete this business comment',
        );
      }

      const deletedBusinessComment = (await this.prisma.businessComment.update({
        where: { id },
        data: { isActive: false, updatedById: userId },
      })) as BusinessComment;

      return deletedBusinessComment.isActive === false;
    } catch (error) {
      this.logger.error(`Failed to delete business comment`, error);
      throw error;
    }
  }

  /**
   * Get average rating for a business
   */
  async getAverageRating(businessId: string): Promise<number> {
    try {
      const result = await this.prisma.businessComment.aggregate({
        where: {
          businessId,
          isActive: true,
        },
        _avg: {
          rating: true,
        },
      });

      return result._avg.rating || 0;
    } catch (error) {
      this.logger.error(
        `Failed to get average rating for business ${businessId}`,
        error,
      );
      throw error;
    }
  }

  /**
   * Get total comment count for a business
   */
  async getCommentCount(businessId: string): Promise<number> {
    try {
      return await this.prisma.businessComment.count({
        where: {
          businessId,
          isActive: true,
        },
      });
    } catch (error) {
      this.logger.error(
        `Failed to get comment count for business ${businessId}`,
        error,
      );
      throw error;
    }
  }

  private mapToDto(businessComment: BusinessComment): BusinessCommentDto {
    return plainToClass(BusinessCommentDto, businessComment);
  }
}
