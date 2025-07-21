/**
 * Device Token Input Interface
 * Used for registering or updating a device token
 */
export interface ICreateDeviceToken {
  /**
   * The device token
   */
  token: string;

  /**
   * Type of the device (e.g., 'ios', 'android', 'web')
   */
  deviceType: string;
}
