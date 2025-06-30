import { registerEnumType } from '@nestjs/graphql';
import { GroupPrivacy } from '@motorove/shared';

registerEnumType(GroupPrivacy, {
  name: 'GroupPrivacy',
  description: 'Privacy levels for groups',
});

export { GroupPrivacy };
