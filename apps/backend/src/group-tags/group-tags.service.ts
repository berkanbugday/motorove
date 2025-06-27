import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupTag } from './models/group-tag.model';
import { GroupTagDto } from './dto/group-tag.dto';

@Injectable()
export class GroupTagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<GroupTagDto[]> {
    const tags = (await this.prisma.groupTag.findMany({
      orderBy: {
        value: 'asc',
      },
      where: {
        isActive: true,
      },
    })) as unknown as GroupTag[];

    return await Promise.all(tags.map((tag) => this.mapToDto(tag)));
  }

  async findOne(id: string): Promise<GroupTagDto> {
    const tag = (await this.prisma.groupTag.findUnique({
      where: { id, isActive: true },
    })) as unknown as GroupTag;

    return this.mapToDto(tag);
  }

  private mapToDto(tag: GroupTag): GroupTagDto {
    return {
      id: tag.id,
      value: tag.value,
    };
  }
}
