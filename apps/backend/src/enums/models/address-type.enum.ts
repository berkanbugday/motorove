import { registerEnumType } from '@nestjs/graphql';

export enum AddressType {
  POST_LOCATION = 'POST_LOCATION',
  EVENT_MEETING_POINT = 'EVENT_MEETING_POINT',
  EVENT_START_LOCATION = 'EVENT_START_LOCATION',
  EVENT_FINISH_LOCATION = 'EVENT_FINISH_LOCATION',
}

registerEnumType(AddressType, {
  name: 'AddressType',
  description:
    'The types of addresses that can be associated with a post or event',
});
