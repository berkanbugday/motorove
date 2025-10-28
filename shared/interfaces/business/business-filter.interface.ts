import { BusinessCategory } from "../../enums";

/**
 * Business Interface
 * Interface for motorcycle-related businesses
 */
export interface IBusinessFilter {
  categories?: BusinessCategory[];
  minRating?: number;
  searchQuery?: string;
  isOpen?: boolean;
  isOpen24h?: boolean;
}
