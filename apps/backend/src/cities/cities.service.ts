import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { City } from './models/city.model';
import { CityDto } from './dto/city.dto';

@Injectable()
export class CitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(): Promise<CityDto[]> {
    const cities = (await this.prisma.city.findMany({
      orderBy: {
        value: 'asc',
      },
    })) as unknown as City[];

    return cities.map((c) => this.mapToDto(c));
  }

  async findOne(id: string): Promise<CityDto> {
    const city = (await this.prisma.city.findUnique({
      where: { id },
    })) as unknown as City;

    if (!city) {
      throw new NotFoundException('City not found');
    }

    return this.mapToDto(city);
  }

  private mapToDto(city: City): CityDto {
    return {
      id: city.id,
      value: city.value,
    };
  }
}
