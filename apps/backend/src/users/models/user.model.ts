import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { Group } from '../../groups/models/group.model';
import { IUser } from '@motorove/shared';

@ObjectType()
export class User implements IUser {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

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
