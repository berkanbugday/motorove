import { Resolver, Query, Args, ID } from '@nestjs/graphql';
import { GroupTagsService } from './group-tags.service';
import { GroupTag } from './models/group-tag.model';

@Resolver(() => GroupTag)
export class GroupTagsResolver {
  constructor(private readonly groupTagsService: GroupTagsService) {}

  @Query(() => [GroupTag], { name: 'groupTags' })
  findAll() {
    return this.groupTagsService.findAll();
  }

  @Query(() => GroupTag, { name: 'groupTag', nullable: true })
  findOne(@Args('id', { type: () => ID }) id: string) {
    return this.groupTagsService.findOne(id);
  }
}
