import { registerEnumType } from '@nestjs/graphql';
import { Gender } from '@motorove/shared';

registerEnumType(Gender, {
  name: 'Gender',
  description: 'Gender options',
});

export { Gender };
