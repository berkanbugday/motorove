/**
 * Group domain model
 * Based on the backend Group model
 */

import {GroupPrivacy} from '../enums';
import {City} from './city.model';
import {GroupTag} from './group-tag.model';

/**
 * Basic group information
 */
export interface Group {
  id: string;
  name: string;
  description: string;
  cityId: string;
  privacy: GroupPrivacy;
  logo?: string;
  cover?: string;
  membersCapacity?: number;
  isActive: boolean;
  createdById: string;
  updatedById: string;
  createdAt: string;
  updatedAt: string;

  // Additional fields for frontend
  isAdmin?: boolean;
  isMember?: boolean;
}

/**
 * Group with relations
 */
export interface GroupWithRelations extends Group {
  city?: City;
  tags?: GroupTag[];
  createdBy?: any; // Will define proper User type
  updatedBy?: any; // Will define proper User type
  memberships?: any[]; // Will define proper GroupMembership type
  posts?: any[]; // Will define proper Post type
  events?: any[]; // Will define proper Event type
}
