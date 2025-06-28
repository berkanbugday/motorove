import { AddressType, Language } from "../../enums";
import { IEvent } from "../event/event.interface";
import { IPost } from "../post/post.interface";

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
