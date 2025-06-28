import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';
import { ICreateDeviceToken } from '@motorove/shared';

@InputType()
export class CreateDeviceTokenInput implements ICreateDeviceToken {
  @Field()
  @IsNotEmpty()
  @IsString()
  userId: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  token: string;

  @Field()
  @IsNotEmpty()
  @IsString()
  deviceType: string;
}
