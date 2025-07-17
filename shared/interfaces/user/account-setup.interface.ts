import { Gender, RidingStyle, Interest } from "../../enums";

export interface IAccountSetup {
  cityId: string;
  dateOfBirth?: Date | null;
  gender?: Gender | null;
  ridingStyles?: RidingStyle[] | null;
  interests?: Interest[] | null;
  avatar?: string | null;
}
