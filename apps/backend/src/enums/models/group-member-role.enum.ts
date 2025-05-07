import { registerEnumType } from '@nestjs/graphql';

export enum GroupMemberRole {
  ADMIN = 'Admin',
  MEMBER = 'Member',
}

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'The role of a user in a group',
});
