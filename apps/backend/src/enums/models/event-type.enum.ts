import { registerEnumType } from '@nestjs/graphql';

export enum EventType {
  SOLO_RIDE = 'SOLO_RIDE',
  GROUP_RIDE = 'GROUP_RIDE',
  CAMPING_RIDE = 'CAMPING_RIDE',
  MEET_UP = 'MEET_UP',
  TRAINING = 'TRAINING',
  SOCIAL_RESPONSIBILITY = 'SOCIAL_RESPONSIBILITY',
}

registerEnumType(EventType, {
  name: 'EventType',
  description: 'The types of events that can be created',
});
