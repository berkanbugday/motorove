/**
 * Group Tag domain model
 * Based on the backend GroupTag model
 */

/**
 * Basic group tag information
 */
export interface GroupTag {
  id: string;
  value: string;
  isActive: boolean;
}
