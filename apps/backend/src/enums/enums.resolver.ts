import { Resolver, Query, ObjectType, Field } from '@nestjs/graphql';
import { GroupPrivacy } from './models/group-privacy.enum';
import { GroupMemberRole } from './models/group-member-role.enum';
import { InvitationStatus } from './models/invitation-status.enum';
import { EventType } from './models/event-type.enum';
import { RoadType } from './models/road-type.enum';
import { DifficultyLevel } from './models/difficulty-level.enum';
import { ExperienceLevel } from './models/experience-level.enum';
import { AddressType } from './models/address-type.enum';
import { Language } from './models/language.enum';

@ObjectType()
class EnumItem {
  @Field()
  key: string;

  @Field()
  value: string;
}

@Resolver()
export class EnumsResolver {
  @Query(() => [EnumItem])
  getGroupPrivacyOptions() {
    return Object.entries(GroupPrivacy).map(([key, value]) => ({ key, value }));
  }

  @Query(() => [EnumItem])
  getGroupMemberRoles() {
    return Object.entries(GroupMemberRole).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getInvitationStatuses() {
    return Object.entries(InvitationStatus).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getEventTypes() {
    return Object.entries(EventType).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getRoadTypes() {
    return Object.entries(RoadType).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getDifficultyLevels() {
    return Object.entries(DifficultyLevel).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getExperienceLevels() {
    return Object.entries(ExperienceLevel).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getAddressTypes() {
    return Object.entries(AddressType).map(([key, value]) => ({
      key,
      value,
    }));
  }

  @Query(() => [EnumItem])
  getLanguages() {
    return Object.entries(Language).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
