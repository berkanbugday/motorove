import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { Group } from '../../groups/models/group.model';

@ObjectType()
export class User {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String, { nullable: true })
  firstName: string | null;

  @Field(() => String, { nullable: true })
  lastName: string | null;

  @Field(() => String, { nullable: true })
  avatar: string | null;

  @Field(() => String)
  supabaseId: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [Group], { nullable: true })
  createdGroups?: Group[];

  @Field(() => [GroupMembership], { nullable: true })
  groupMemberships?: GroupMembership[];
}
