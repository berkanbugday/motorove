import { Resolver, Query, ObjectType, Field } from '@nestjs/graphql';
import { GroupPrivacy } from './models/group-privacy.enum';
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
}
