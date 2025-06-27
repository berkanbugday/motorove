import { ObjectType, Field, Int, ID } from '@nestjs/graphql';
import { GroupPrivacy } from '../../enums/models/group-privacy.enum';
import { BaseModel } from '../../core/models';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { City } from '../../cities/models/city.model';
import { GroupTag } from '../../group-tags/models/group-tag.model';
import { Post } from '../../posts/models/post.model';
import { Event } from '../../events/models/event.model';

@ObjectType()
export class Group extends BaseModel {
  @Field(() => String)
  name: string;

  @Field(() => String)
  description: string;

  @Field(() => String, { nullable: true })
  logo: string | null;

  @Field(() => String, { nullable: true })
  cover: string | null;

  @Field(() => ID)
  cityId: string;

  @Field(() => City)
  city: City;

  @Field(() => GroupPrivacy)
  privacy: GroupPrivacy;

  @Field(() => [GroupTag])
  tags: GroupTag[];

  @Field(() => Int, { nullable: true })
  membersCapacity: number | null;

  @Field(() => [GroupMembership])
  memberships: GroupMembership[];

  @Field(() => [Post])
  posts: Post[];

  @Field(() => [Event])
  events: Event[];
}
