import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupTag } from './models/group-tag.model';
import { GroupTagDto } from './dto/group-tag.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class GroupTagsService {
  private readonly logger = new Logger(GroupTagsService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<GroupTagDto[]> {
    try {
      const tags = (await this.prisma.groupTag.findMany({
        orderBy: {
          value: 'asc',
        },
        where: {
          isActive: true,
        },
      })) as unknown as GroupTag[];

      return await Promise.all(tags.map((tag) => this.mapToDto(tag)));
    } catch (error) {
      this.logger.error(`Failed to get group tags`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<GroupTagDto> {
    try {
      const tag = (await this.prisma.groupTag.findUnique({
        where: { id, isActive: true },
      })) as unknown as GroupTag;

      return this.mapToDto(tag);
    } catch (error) {
      this.logger.error(`Failed to get group tag with ID ${id}`, error);
      throw error;
    }
  }

  private mapToDto(tag: GroupTag): GroupTagDto {
    return plainToClass(GroupTagDto, tag);
  }
}
