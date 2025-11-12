import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBusinessCommentInput } from './dto/create-business-comment.input';
import { UpdateBusinessCommentInput } from './dto/update-business-comment.input';
import { BusinessComment } from './models/business-comment.model';
import { BusinessCommentDto } from './dto/business-comment.dto';
import { plainToClass } from 'class-transformer';
import { ProfanityFilterService } from '../core/profanity-filter/profanity-filter.service';
import { StorageService } from '../core/storage/storage.service';

@Injectable()
export class BusinessCommentsService {
  private readonly logger = new Logger(BusinessCommentsService.name);
  constructor(
    private readonly prisma: PrismaService,
    private readonly profanityFilterService: ProfanityFilterService,
    private readonly storageService: StorageService,
  ) {}

  async findAll(
    businessId: string,
    limit?: number,
    skip?: number,
    authToken?: string,
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
        },
        orderBy: { createdAt: 'desc' },
        skip: skip || undefined,
        take: limit || undefined,
      })) as BusinessComment[];

      return Promise.all(
        businessComments.map(async (comment) => {
          if (comment.createdBy.avatar) {
            comment.createdBy.avatar = await this.storageService.getSignedUrl(
              comment.createdBy.avatar,
              3600,
              authToken,
            );
          }

          return this.mapToDto(comment);
        }),
      );
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
        },
      })) as BusinessComment;

      if (!businessComment || !businessComment.isActive) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'business_comment',
          id,
        });
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
        ExceptionHelper.badRequest('errors.business_comment.rating_invalid');
      }

      // Check if the business exists and is active
      const business = await this.prisma.business.findFirst({
        where: { id: input.businessId },
      });

      if (!business || !business.isActive) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'business',
          id: input.businessId,
        });
      }

      // Check if user already commented on this business
      const existingComment = await this.prisma.businessComment.findFirst({
        where: {
          businessId: input.businessId,
          createdById: userId,
          isActive: true,
        },
      });

      if (!existingComment) {
        ExceptionHelper.badRequest('errors.common.already_exists', {
          resource: 'business_comment',
        });
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
        ExceptionHelper.badRequest('errors.business_comment.rating_invalid');
      }

      const businessComment = (await this.prisma.businessComment.findFirst({
        where: { id: input.id },
        include: {
          createdBy: true,
        },
      })) as BusinessComment;

      if (!businessComment || !businessComment.isActive) {
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'business_comment',
          id: input.id,
        });
      }

      // Check if user is the creator
      if (businessComment.createdById !== userId) {
        ExceptionHelper.forbidden('errors.business_comment.cannot_update');
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
        ExceptionHelper.notFound('errors.common.not_found_with_id', {
          resource: 'business_comment',
          id,
        });
      }

      // Check if user is the creator
      if (businessComment.createdById !== userId) {
        ExceptionHelper.forbidden('errors.business_comment.cannot_delete');
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
    const dto = plainToClass(BusinessCommentDto, businessComment);
    dto.content = this.profanityFilterService.filterText(dto.content);
    return dto;
  }
}
