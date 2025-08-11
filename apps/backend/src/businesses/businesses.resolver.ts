import { Resolver, Query, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { BusinessesService } from './businesses.service';
import { BusinessDto } from './dto/business.dto';

@Resolver(() => BusinessDto)
export class BusinessesResolver {
  constructor(private businessesService: BusinessesService) {}

  @UseGuards(JwtGuard)
  @Query(() => [BusinessDto], { name: 'businesses' })
  async findAll(): Promise<BusinessDto[]> {
    return await this.businessesService.findAll();
  }

  @UseGuards(JwtGuard)
  @Query(() => BusinessDto, { name: 'business' })
  async findOne(@Args('id') id: string): Promise<BusinessDto> {
    return await this.businessesService.findOne(id);
  }
}
