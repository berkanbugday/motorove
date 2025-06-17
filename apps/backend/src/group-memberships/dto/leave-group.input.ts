import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class LeaveGroupInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;
}
