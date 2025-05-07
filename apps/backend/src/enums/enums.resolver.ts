import { Resolver, Query, ObjectType, Field } from '@nestjs/graphql';
import { City } from './models/city.enum';
import { GroupPrivacy } from './models/group-privacy.enum';
import { GroupTag } from './models/group-tag.enum';
import { GroupMemberRole } from './models/group-member-role.enum';

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
  getCities() {
    return Object.entries(City).map(([key, value]) => ({ key, value }));
  }

  @Query(() => [EnumItem])
  getGroupPrivacyOptions() {
    return Object.entries(GroupPrivacy).map(([key, value]) => ({ key, value }));
  }

  @Query(() => [EnumItem])
  getGroupTags() {
    return Object.entries(GroupTag).map(([key, value]) => ({ key, value }));
  }

  @Query(() => [EnumItem])
  getGroupMemberRoles() {
    return Object.entries(GroupMemberRole).map(([key, value]) => ({
      key,
      value,
    }));
  }
}
