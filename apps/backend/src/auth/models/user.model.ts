import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { Group } from '../../groups/models/group.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field()
  email: string;

  @Field({ nullable: true })
  firstName?: string;

  @Field({ nullable: true })
  lastName?: string;

  @Field({ nullable: true })
  avatar?: string;

  @Field()
  supabaseId: string;

  @Field()
  createdAt: Date;

  @Field()
  updatedAt: Date;

  @Field(() => [Group], { nullable: true })
  createdGroups?: Group[];

  @Field(() => [GroupMembership], { nullable: true })
  groupMemberships?: GroupMembership[];

  @Field()
  isActive: boolean;
}
