import { BusinessCategory } from "../../enums";
import { IBusinessDescription } from "./business-description.interface";
import { IWorkingHour } from "./working-hour.interface";
import { IAddress } from "../address";

/**
 * Business Interface
 * Interface for motorcycle-related businesses
 */
export interface IBusiness {
  id: string;
  name: string;
  mainCategory: BusinessCategory;
  subCategories: BusinessCategory[];
  phoneNumber: string;
  descriptions: IBusinessDescription[];
  workingHours: IWorkingHour[];
  address: IAddress;
}
