import { ObjectType, Field, Int } from '@nestjs/graphql';
import { City } from './city.enum';
import { GroupPrivacy } from './group-privacy.enum';
import { GroupTag } from './group-tag.enum';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { BaseModel } from '../../core/models';

@ObjectType()
export class Group extends BaseModel {
  @Field()
  name: string;

  @Field()
  description: string;

  @Field({ nullable: true })
  logo?: string;

  @Field({ nullable: true })
  cover?: string;

  @Field(() => City)
  city: City;

  @Field(() => GroupPrivacy)
  privacy: GroupPrivacy;

  @Field(() => [GroupTag])
  tags: GroupTag[];

  @Field(() => Int, { nullable: true })
  membersCapacity?: number;

  @Field(() => [GroupMembership])
  memberships: GroupMembership[];
}
