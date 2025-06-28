import { IUser } from "../user";

/**
 * Base Interface
 * Common fields for all entities with auditing
 */
export interface IBase {
  id: string;
  createdById: string;
  createdAt: Date | string;
  updatedById: string;
  updatedAt: Date | string;
  isActive: boolean;
}

/**
 * Base Interface with Relations
 * Extends base interface with common relation fields
 */
export interface IBaseWithRelations extends IBase {
  createdBy?: Partial<IUser>;
  updatedBy?: Partial<IUser>;
}
