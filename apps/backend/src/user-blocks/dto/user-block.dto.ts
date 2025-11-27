import { Field, ObjectType, ID } from '@nestjs/graphql';
import { UserDto } from '../../users/dto/user.dto';
import { IUserBlock } from '@motorove/shared';
import { IsDate, IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType()
export class UserBlockDto implements IUserBlock {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  blocked: Partial<UserDto>;

  @Field(() => Date)
  @IsDate()
  @IsNotEmpty()
  createdAt: Date;
}
