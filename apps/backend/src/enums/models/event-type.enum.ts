import { registerEnumType } from '@nestjs/graphql';

export enum EventType {
  SOLO_RIDE = 'SOLO_RIDE',
  GROUP_RIDE = 'GROUP_RIDE',
  CAMPING_RIDE = 'CAMPING_RIDE',
  SOCIAL_MEET_UP = 'SOCIAL_MEET_UP',
  WORKSHOP_TRAINING = 'WORKSHOP_TRAINING',
  CHARITY_RIDE = 'CHARITY_RIDE',
}

registerEnumType(EventType, {
  name: 'EventType',
  description: 'The types of events that can be created',
});
