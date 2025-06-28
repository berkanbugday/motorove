import { ICreateEvent } from "./create-event.interface";

/**
 * Update Event Interface
 * Extends the create event interface with an ID field
 */
export interface IUpdateEvent extends Partial<ICreateEvent> {
  /**
   * ID of the event to update
   */
  id: string;
}
