import { registerEnumType } from '@nestjs/graphql';
import { RoadType } from '@motorove/shared';

registerEnumType(RoadType, {
  name: 'RoadType',
  description: 'Type of road surface for motorcycle rides',
});
