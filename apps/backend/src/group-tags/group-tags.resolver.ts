import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { GroupTagsService } from './group-tags.service';
import { GroupTagDto } from './dto/group-tag.dto';
import { JwtGuard } from '../auth/guards/jwt.guard';
import { UseGuards } from '@nestjs/common';

@Resolver(() => GroupTagDto)
export class GroupTagsResolver {
  constructor(private readonly groupTagsService: GroupTagsService) {}

  @UseGuards(JwtGuard)
  @Query(() => [GroupTagDto], { name: 'groupTags' })
  async findAll(): Promise<GroupTagDto[]> {
    return await this.groupTagsService.findAll();
  }

  @UseGuards(JwtGuard)
  @Query(() => GroupTagDto, { name: 'groupTag' })
  async findOne(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<GroupTagDto> {
    return await this.groupTagsService.findOne(id);
  }
}
