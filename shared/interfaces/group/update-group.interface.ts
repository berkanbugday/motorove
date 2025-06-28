import { ICreateGroup } from "./create-group.interface";

/**
 * Update Group Interface
 * Used for updating existing groups
 */
export interface IUpdateGroup extends Partial<ICreateGroup> {
  /**
   * Group ID to identify which group to update
   */
  id: string;
}
