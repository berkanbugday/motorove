import { Injectable, Logger } from '@nestjs/common';
import { ExceptionHelper } from '../core/exceptions/exception-helper.service';
import { PrismaService } from '../prisma/prisma.service';
import { City } from './models/city.model';
import { CityDto } from './dto/city.dto';
import { plainToClass } from 'class-transformer';

@Injectable()
export class CitiesService {
  private readonly logger = new Logger(CitiesService.name);
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CityDto[]> {
    try {
      const cities = await this.prisma.city.findMany({
        orderBy: {
          value: 'asc',
        },
      });

      return await Promise.all(cities.map((c) => this.mapToDto(c)));
    } catch (error) {
      this.logger.error(`Failed to get cities`, error);
      throw error;
    }
  }

  async findOne(id: string): Promise<CityDto> {
    try {
      const city = await this.prisma.city.findFirst({
        where: { id },
      });

      if (!city) {
        ExceptionHelper.notFound('errors.common.not_found', {
          resource: 'city',
        });
      }

      return this.mapToDto(city);
    } catch (error) {
      this.logger.error(`Failed to get city with ID ${id}`, error);
      throw error;
    }
  }

  private mapToDto(city: City): CityDto {
    return plainToClass(CityDto, city);
  }
}
