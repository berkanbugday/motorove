import React, {useEffect} from 'react';
import {useNotificationPermission} from '@hooks/useNotificationPermission';

/**
 * Component that handles notification permission checking and synchronization
 * Placed inside LanguageProvider to avoid context errors
 */
export const NotificationPermissionHandler: React.FC = () => {
  const {checkPermission} = useNotificationPermission();

  // Check notification permission on mount
  useEffect(() => {
    checkPermission();
  }, [checkPermission]);

  // This is a utility component with no UI
  return null;
};

export default NotificationPermissionHandler;
