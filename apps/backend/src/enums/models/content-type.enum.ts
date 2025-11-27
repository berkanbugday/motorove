import { registerEnumType } from '@nestjs/graphql';
import { ContentType } from '@motorove/shared';

registerEnumType(ContentType, {
  name: 'ContentType',
  description: 'Type of content that can be reported',
});

export { ContentType };
