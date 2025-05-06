import { registerEnumType } from '@nestjs/graphql';

export enum GroupPrivacy {
  PUBLIC = 'Public',
  PRIVATE = 'Private',
}

registerEnumType(GroupPrivacy, {
  name: 'GroupPrivacy',
  description: 'Privacy levels for groups',
});
