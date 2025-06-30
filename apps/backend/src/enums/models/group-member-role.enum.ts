import { registerEnumType } from '@nestjs/graphql';
import { GroupMemberRole } from '@motorove/shared';

registerEnumType(GroupMemberRole, {
  name: 'GroupMemberRole',
  description: 'The role of a user in a group',
});

export { GroupMemberRole };
