import { ObjectType, Field, ID, registerEnumType } from '@nestjs/graphql';
import { Role } from '../../../generated/prisma';
import { GroupMembership } from 'src/group-memberships/models/group-membership.model';
import { Group } from 'src/groups/models/group.model';

// Import GroupMembership at the end to avoid circular dependency
// import { GroupMembership } from '../../groups/models/group-membership.model';

registerEnumType(Role, {
  name: 'Role',
});

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

  @Field(() => Role)
  role: Role;

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
}
