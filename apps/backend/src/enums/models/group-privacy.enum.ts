import { registerEnumType } from '@nestjs/graphql';

export enum GroupPrivacy {
  PUBLIC = 'PUBLIC',
  PRIVATE = 'PRIVATE',
}

registerEnumType(GroupPrivacy, {
  name: 'GroupPrivacy',
  description: 'Privacy levels for groups',
});
