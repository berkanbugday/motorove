import { registerEnumType } from '@nestjs/graphql';
import { GroupTag } from '@motorove/shared';

registerEnumType(GroupTag, {
  name: 'GroupTag',
  description: 'Tags for categorizing groups',
});

export { GroupTag };
