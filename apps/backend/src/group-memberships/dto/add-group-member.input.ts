import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class AddGroupMemberInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
