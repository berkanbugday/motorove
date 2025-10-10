import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { BusinessDto } from './dto/business.dto';
import { plainToClass } from 'class-transformer';
import { Business } from '../businesses/models/business.model';

@Injectable()
export class BusinessesService {
  private readonly logger = new Logger(BusinessesService.name);

  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<BusinessDto[]> {
    const businesses = (await this.prisma.business.findMany({
      where: {
        isActive: true,
      },
      include: {
        address: true,
        descriptions: {
          where: { isActive: true },
        },
        workingHours: {
          where: { isActive: true },
        },
      },
      orderBy: { name: 'asc' },
    })) as Business[];

    return businesses.map((business) => plainToClass(BusinessDto, business));
  }

  async findOne(id: string): Promise<BusinessDto> {
    const business = (await this.prisma.business.findFirst({
      where: {
        id,
        isActive: true,
      },
      include: {
        address: true,
        descriptions: {
          where: { isActive: true },
        },
        workingHours: {
          where: { isActive: true },
        },
      },
    })) as Business;

    if (!business) {
      throw new NotFoundException('Business not found');
    }

    return plainToClass(BusinessDto, business);
  }
}
