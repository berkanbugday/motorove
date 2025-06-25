import { Field, ObjectType, ID } from '@nestjs/graphql';
import { User } from '../../users/models/user.model';

@ObjectType()
export class EventInvitation {
  @Field(() => ID)
  id: string;

  @Field(() => String)
  eventId: string;

  @Field(() => String)
  inviterId: string;

  @Field(() => User)
  inviter: User;

  @Field(() => String)
  inviteeId: string;

  @Field(() => User)
  invitee: User;

  @Field(() => String)
  status: string; // PENDING, ACCEPTED, REJECTED

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
