import { EmergencyType } from '../../enums/emergency-type.enum';

export interface IEmergency {
  id: string;
  userId: string;
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICreateEmergency {
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
}

export interface IEmergencyNotification {
  emergencyId: string;
  type: EmergencyType;
  title: string;
  description?: string;
  latitude: number;
  longitude: number;
  address?: string;
  userName: string;
  userProfileImage?: string;
  distance?: number;
  createdAt: Date;
}
