import { AddressType, Language } from "../../enums";

/**
 * Address Interface
 * Interface for location addresses
 */
export interface IAddress {
  id: string;
  address: string;
  language: Language;
  type: AddressType;
  latitude: number;
  longitude: number;
  postId?: string | null;
  eventId?: string | null;
}

/**
 * Address with relations
 */
export interface IAddressWithRelations extends IAddress {
  post?: {
    id: string;
    content: string;
  } | null;

  event?: {
    id: string;
    title: string;
  } | null;
}
