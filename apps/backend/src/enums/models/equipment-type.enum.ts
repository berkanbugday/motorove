import { registerEnumType } from '@nestjs/graphql';
import { EquipmentType } from '@motorove/shared';

registerEnumType(EquipmentType, {
  name: 'EquipmentType',
  description: 'Types of motorcycle equipment',
});

export { EquipmentType };
