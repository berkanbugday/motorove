import { ObjectType, Field, ID } from '@nestjs/graphql';
import { GroupMembership } from '../../group-memberships/models/group-membership.model';
import { Group } from '../../groups/models/group.model';
import { IUser } from '@motorove/shared';
import { City } from '../../cities/models/city.model';
import { Post } from '../../posts/models/post.model';
import { Comment } from '../../comments/models/comment.model';
import { PostLike } from '../../posts/models/post-like.model';
import { PostSave } from '../../posts/models/post-save.model';
import { Garage } from './garage.model';
import { Notification } from '../../notifications/models/notification.model';
import { UserFollowing } from '../../user-followings/models/user-following.model';
import { Gender } from '../../enums/models/gender.enum';
import { RidingStyle } from '../../enums/models/riding-style.enum';
import { Interest } from '../../enums/models/interest.enum';
import { SocialMedia } from './social-media.model';
import { EventParticipant } from '../../events/models/event-participant.model';
import { EventInvitation } from '../../events/models/event-invitation.model';

@ObjectType()
export class User implements IUser {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  email: string;

  @Field(() => String)
  firstName: string;

  @Field(() => String)
  lastName: string;

  @Field(() => String, { nullable: true })
  avatar?: string;

  @Field(() => String)
  supabaseId: string;

  @Field(() => String, { nullable: true })
  bio?: string;

  @Field(() => String, { nullable: true })
  cityId?: string;

  @Field(() => City, { nullable: true })
  city?: City;

  @Field(() => Date, { nullable: true })
  dateOfBirth?: Date;

  @Field(() => Gender, { nullable: true })
  gender?: Gender;

  @Field(() => [RidingStyle], { nullable: true })
  ridingStyle?: RidingStyle[];

  @Field(() => [Interest], { nullable: true })
  interests?: Interest[];

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => Boolean)
  isActive: boolean;

  @Field(() => [Group], { nullable: true })
  createdGroups?: Group[];

  @Field(() => [GroupMembership], { nullable: true })
  groupMemberships?: GroupMembership[];

  @Field(() => [Post], { nullable: true })
  posts?: Post[];

  @Field(() => [Comment], { nullable: true })
  comments?: Comment[];

  @Field(() => [PostLike], { nullable: true })
  postLikes?: PostLike[];

  @Field(() => [PostSave], { nullable: true })
  postSaves?: PostSave[];

  @Field(() => [Garage], { nullable: true })
  garages?: Garage[];

  @Field(() => [Notification], { nullable: true })
  notifications?: Notification[];

  @Field(() => [SocialMedia], { nullable: true })
  socialMediaProfiles?: SocialMedia[];

  @Field(() => [UserFollowing], { nullable: true })
  followers?: UserFollowing[];

  @Field(() => [UserFollowing], { nullable: true })
  following?: UserFollowing[];

  @Field(() => [EventParticipant], { nullable: true })
  eventParticipations?: EventParticipant[];

  @Field(() => [EventInvitation], { nullable: true })
  receivedInvitations?: EventInvitation[];

  @Field(() => [EventInvitation], { nullable: true })
  createdEventInvitations?: EventInvitation[];
}
