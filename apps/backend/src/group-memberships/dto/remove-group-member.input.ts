import { InputType, Field } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';

@InputType()
export class RemoveGroupMemberInput {
  @Field()
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field()
  @IsUUID()
  @IsNotEmpty()
  memberId: string;
}
