import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { GroupTag } from './models/group-tag.model';

@Injectable()
export class GroupTagsService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<GroupTag[]> {
    return await this.prisma.groupTag.findMany({
      orderBy: {
        value: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<GroupTag | null> {
    return await this.prisma.groupTag.findUnique({
      where: { id },
    });
  }
}
