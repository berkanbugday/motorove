import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateGroupInput } from './create-group.input';
import { IsNotEmpty, IsUUID } from 'class-validator';
import { IUpdateGroup } from '@motorove/shared';

@InputType()
export class UpdateGroupInput
  extends PartialType(CreateGroupInput)
  implements IUpdateGroup
{
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
