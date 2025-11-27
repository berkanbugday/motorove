import { registerEnumType } from '@nestjs/graphql';
import { ModerationAction } from '@motorove/shared';

registerEnumType(ModerationAction, {
  name: 'ModerationAction',
  description: 'Action taken during content moderation',
});

export { ModerationAction };
