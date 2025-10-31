import { Language } from "../../enums";

export interface ICreateEmergencyAddress {
  address: string;
  countryCode?: string;
  latitude: number;
  longitude: number;
  language: Language;
}
