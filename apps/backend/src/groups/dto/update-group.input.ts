import { InputType, Field, PartialType, ID } from '@nestjs/graphql';
import { CreateGroupInput } from './create-group.input';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class UpdateGroupInput extends PartialType(CreateGroupInput) {
  @Field(() => ID)
  @IsNotEmpty()
  @IsUUID()
  id: string;
}
