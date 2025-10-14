import { ObjectType, Field, ID } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

import { EventDto } from './event.dto';
import { Type } from 'class-transformer';

@ObjectType()
export class EventInvitationDto {
  @Field(() => ID)
  @IsUUID()
  id: string;

  @Field(() => EventDto)
  @Type(() => EventDto)
  event: EventDto;
}
