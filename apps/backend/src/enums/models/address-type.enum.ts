import { registerEnumType } from '@nestjs/graphql';
import { AddressType } from '@motorove/shared';

registerEnumType(AddressType, {
  name: 'AddressType',
  description:
    'The types of addresses that can be associated with a post or event',
});
