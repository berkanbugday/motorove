import { WarningType } from '../../enums/warning-type.enum';
import { IWarningAddress } from './warning-address.interface';
import { IWarningDescription } from './warning-description.interface';

export interface ICreateWarning extends IWarningAddress, IWarningDescription {
  type: WarningType;
  expiresAt?: Date;
}
