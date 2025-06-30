import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateEventInput } from './create-event.input';
import { IsUUID } from 'class-validator';
import { IUpdateEvent } from '@motorove/shared';

@InputType()
export class UpdateEventInput
  extends PartialType(CreateEventInput)
  implements IUpdateEvent
{
  @Field(() => String)
  @IsUUID()
  id: string;
}
