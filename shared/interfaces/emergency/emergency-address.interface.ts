import { Language } from "../../enums";

export interface IEmergencyAddress {
  id: string;
  address: string;
  countryCode?: string | null;
  latitude: number;
  longitude: number;
  language: Language;
}
