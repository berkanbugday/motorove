import { IBaseDescription } from '../common/base-description.interface';

/**
 * Warning Description Interface
 * Description-related fields for warning entities
 */
export interface IWarningDescription extends IBaseDescription {
  // Inherits title, description from IBaseDescription
  // Can add warning-specific description fields here if needed in the future
}
