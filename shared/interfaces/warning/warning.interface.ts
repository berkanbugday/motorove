import { WarningType } from '../../enums/warning-type.enum';
import { IWarningAddress } from './warning-address.interface';
import { IWarningDescription } from './warning-description.interface';

export interface IWarning extends IWarningAddress, IWarningDescription {
  id: string;
  type: WarningType;
  userId: string;
  userName: string;
  userAvatar?: string;
  isActive: boolean;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}
