import { registerEnumType } from '@nestjs/graphql';

export enum RoadType {
  ASPHALT = 'ASPHALT',
  OFF_ROAD = 'OFF_ROAD',
  MIXED = 'MIXED',
}

registerEnumType(RoadType, {
  name: 'RoadType',
  description: 'Type of road surface for motorcycle rides',
});
