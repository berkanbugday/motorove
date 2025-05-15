import { registerEnumType } from '@nestjs/graphql';

export enum NotificationType {
  SYSTEM = 'SYSTEM',
  NEW_MESSAGE = 'NEW_MESSAGE',
  GROUP_INVITE = 'GROUP_INVITE',
  GROUP_JOIN = 'GROUP_JOIN',
  GROUP_LEAVE = 'GROUP_LEAVE',
  RIDE_INVITATION = 'RIDE_INVITATION',
  RIDE_STARTED = 'RIDE_STARTED',
  RIDE_COMPLETED = 'RIDE_COMPLETED',
  MAINTENANCE_REMINDER = 'MAINTENANCE_REMINDER',
  FRIEND_REQUEST = 'FRIEND_REQUEST',
}

registerEnumType(NotificationType, {
  name: 'NotificationType',
  description: 'The type of notification',
});
