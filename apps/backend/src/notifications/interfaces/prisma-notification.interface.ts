import { User } from '../../users/models/user.model';
import { NotificationType } from '../../enums/models/notification-type.enum';
import { NotificationStatus } from '../../enums/models/notification-status.enum';

export interface PrismaNotification {
  id: string;
  title: string;
  body: string;
  type: NotificationType;
  data: string | null;
  userId: string;
  user?: Partial<User>;
  status: NotificationStatus;
  read: boolean;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  createdBy?: Partial<User>;
  createdById?: string;
  updatedBy?: Partial<User>;
  updatedById?: string;
}
