import { InputType, Field } from '@nestjs/graphql';
import { IsString, IsNotEmpty } from 'class-validator';
import { ICreateEmergencyDescription } from '@motorove/shared';

@InputType()
export class CreateEmergencyDescriptionInput
  implements ICreateEmergencyDescription
{
  @Field()
  @IsString()
  @IsNotEmpty()
  description: string;
}
