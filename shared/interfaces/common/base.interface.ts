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
  createdBy?: Partial<IUser>;
  updatedBy?: Partial<IUser>;
}
