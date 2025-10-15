import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';
import { UserDto } from '../../users/dto/user.dto';
import { EventParticipantStatus } from '../../enums/models/event-participant-status.enum';

@ObjectType()
export class EventParticipantDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => String)
  @IsUUID()
  eventId: string;

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

  @Field(() => Boolean)
  isActive: boolean;
}
