import { DayOfWeek } from "../../enums";

/**
 * Working Hour Interface
 * Interface for business working hours
 */
export interface IWorkingHour {
  id: string;
  dayOfWeek: DayOfWeek;
  startHour: string;
  endHour: string;
  isOpen24h: boolean;
}
