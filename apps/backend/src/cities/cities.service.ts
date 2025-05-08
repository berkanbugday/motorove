import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { City } from './models/city.model';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<City[]> {
    return await this.prisma.city.findMany({
      orderBy: {
        value: 'asc',
      },
    });
  }

  async findOne(id: string): Promise<City | null> {
    return await this.prisma.city.findUnique({
      where: { id },
    });
  }
}
