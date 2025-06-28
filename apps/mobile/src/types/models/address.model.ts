/**
 * Address domain model
 * Based on the backend Address model
 */
import {AddressType, Language} from '../enums';

/**
 * Basic address information
 */
export interface Address {
  id: string;
  address: string;
  latitude: number;
  longitude: number;
  type: AddressType;
  language: Language;
  postId?: string;
  eventId?: string;
}

/**
 * Address with relations
 */
export interface AddressWithRelations extends Address {
  post?: any; // Will define proper type when Post model is created
  event?: any; // Will define proper type when Event model is created
}
