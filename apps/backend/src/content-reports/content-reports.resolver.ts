import { Resolver, Mutation, Args } from '@nestjs/graphql';
import { UseGuards } from '@nestjs/common';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { User } from '../users/models/user.model';
import { ContentReportsService } from './content-reports.service';
import { CreateContentReportInput } from './dto/create-content-report.input';

@Resolver()
export class ContentReportsResolver {
  constructor(private readonly contentReportsService: ContentReportsService) {}

  @UseGuards(JwtGuard)
  @Mutation(() => Boolean)
  async reportContent(
    @CurrentUser() user: User,
    @Args('input') input: CreateContentReportInput,
  ): Promise<boolean> {
    return await this.contentReportsService.createReport(input, user.id);
  }
}
