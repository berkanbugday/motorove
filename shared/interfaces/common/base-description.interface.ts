import { Language } from "../../enums";

/**
 * Base Description Interface
 * Common fields for entities with descriptive content
 */
export interface IBaseDescription {
  id: string;
  description: string;
  language: Language;
}
