import { Field, InputType } from '@nestjs/graphql';
import { IsUUID } from 'class-validator';

@InputType()
export class FollowUserInput {
  @Field()
  @IsUUID()
  userId: string;
}
