import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { UserDto } from '../../users/dto/user.dto';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';
import { IEventParticipant } from '@motorove/shared';

@ObjectType()
export class EventParticipantDto implements IEventParticipant {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => EventParticipantStatus)
  status: EventParticipantStatus;

  @Field(() => UserDto)
  createdBy: UserDto;

  @Field(() => String)
  @IsUUID()
  createdById: string;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;

  @Field(() => UserDto)
  updatedBy?: UserDto;

  @Field(() => String)
  @IsUUID()
  updatedById: string;

  @Field(() => Boolean)
  isActive: boolean;
}
