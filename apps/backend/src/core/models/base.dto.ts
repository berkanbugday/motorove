import { Field, ID, ObjectType } from '@nestjs/graphql';
import { IBase } from '@motorove/shared';
import { UserDto } from '../../users/dto/user.dto';
import { IsNotEmpty, IsUUID, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

@ObjectType({ isAbstract: true })
export abstract class BaseDto implements IBase {
  @Field(() => ID)
  @IsUUID()
  @IsNotEmpty()
  id: string;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  createdBy: Partial<UserDto>;

  @Field()
  createdById: string;

  @Field()
  createdAt: Date;

  @Field(() => UserDto)
  @ValidateNested()
  @Type(() => UserDto)
  updatedBy: Partial<UserDto>;

  @Field()
  updatedById: string;

  @Field()
  updatedAt: Date;

  @Field()
  isActive: boolean;
}
