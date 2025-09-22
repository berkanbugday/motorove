import {EquipmentType} from '@motorove/shared';

export interface Motorcycle {
  id: string;
  brand: string;
  model: string;
  year?: number;
  description?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface Equipment {
  id: string;
  name: string;
  type: EquipmentType;
  brand: string;
  model: string;
  year?: number;
  description?: string;
  images: string[];
  createdAt: string;
  updatedAt: string;
  isActive: boolean;
}

export interface MotorcycleCardProps {
  motorcycle: Motorcycle;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}

export interface EquipmentCardProps {
  equipment: Equipment;
  onPress?: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
}
