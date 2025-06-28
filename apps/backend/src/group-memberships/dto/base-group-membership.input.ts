import { InputType, Field, ID } from '@nestjs/graphql';
import { IsUUID, IsNotEmpty } from 'class-validator';
import { IBaseGroupMembership } from '@motorove/shared';

@InputType({ isAbstract: true })
export class BaseGroupMembershipInput implements IBaseGroupMembership {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  groupId: string;

  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
