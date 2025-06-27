import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class AddGroupMemberInput {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
