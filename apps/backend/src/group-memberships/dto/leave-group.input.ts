import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsUUID } from 'class-validator';

@InputType()
export class LeaveGroupInput {
  @Field(() => String)
  @IsNotEmpty()
  @IsUUID()
  groupId: string;
}
