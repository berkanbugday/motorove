import { ObjectType, Field, Int } from '@nestjs/graphql';
import { City, GroupPrivacy, GroupTag } from 'generated/prisma';
import { BaseModel } from '../../core/models';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';

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
