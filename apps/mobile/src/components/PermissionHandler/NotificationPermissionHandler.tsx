import React, {useEffect} from 'react';
import {useNotificationPermission} from '@hooks/useNotificationPermission';
import {loggingService} from '@services/logging.service';

/**
 * Component that handles notification permission checking and synchronization
 * Placed inside LanguageProvider to avoid context errors
 */
export const NotificationPermissionHandler: React.FC = () => {
  const {status, checkPermission} = useNotificationPermission();

  // Check notification permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // Log permission status changes for debugging
  useEffect(() => {
    loggingService.debug('Notification permission status changed: ' + status);
  }, [status]);

  // This is a utility component with no UI
  return null;
};

export default NotificationPermissionHandler;
