import { Language } from "../../enums";

/**
 * Base Description Interface
 * Common fields for entities with descriptive content
 */
export interface IBaseCreateDescription {
  description: string;
  language?: Language;
}
