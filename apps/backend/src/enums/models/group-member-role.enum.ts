import { registerEnumType } from '@nestjs/graphql';

export enum GroupMemberRole {
  ADMIN = 'ADMIN',
  MEMBER = 'MEMBER',
}

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'The role of a user in a group',
});
