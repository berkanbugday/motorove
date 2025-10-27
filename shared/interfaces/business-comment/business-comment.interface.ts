import { IBase } from "../common";
import { IBusiness } from "../business";

/**
 * BusinessComment Interface
 * Interface for business comments and reviews
 */
export interface IBusinessComment extends IBase {
  content: string;
  rating: number;
  businessId: string;
  business?: Partial<IBusiness>;
}

