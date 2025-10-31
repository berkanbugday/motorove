import { BusinessCategory } from "../../enums";
import { IBusinessDescription } from "./business-description.interface";
import { IWorkingHour } from "./working-hour.interface";
import { IBusinessAddress } from "./business-address.interface";

/**
 * Business Interface
 * Interface for motorcycle-related businesses
 */
export interface IBusiness {
  id: string;
  name: string;
  category: BusinessCategory;
  countryCode: string;
  phoneNumber: string;
  descriptions: IBusinessDescription[];
  workingHours: IWorkingHour[];
  addresses: IBusinessAddress[];
  averageRating: number;
  commentsCount: number;
}
