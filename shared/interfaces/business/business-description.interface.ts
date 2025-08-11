import { Language } from "../../enums";

/**
 * Business Description Interface
 * Interface for multi-language business descriptions
 */
export interface IBusinessDescription {
  id: string;
  description: string;
  language: Language;
}
