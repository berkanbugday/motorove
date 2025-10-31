import { InputType, Field } from '@nestjs/graphql';
import { ValidateNested, IsEnum, IsOptional } from 'class-validator';
import { EmergencyType } from '../../enums/models/emergency-type.enum';
import { ICreateEmergency } from '@motorove/shared';
import { Type } from 'class-transformer';
import { CreateEmergencyAddressInput } from './create-emergency-address.input';
import { CreateEmergencyDescriptionInput } from './create-emergency-description.input';

@InputType()
export class CreateEmergencyInput implements ICreateEmergency {
  @Field(() => EmergencyType)
  @IsEnum(EmergencyType)
  type: EmergencyType;

  @Field(() => [CreateEmergencyAddressInput])
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyAddressInput)
  addresses: CreateEmergencyAddressInput[];

  @Field(() => [CreateEmergencyDescriptionInput], { nullable: true })
  @ValidateNested({ each: true })
  @Type(() => CreateEmergencyDescriptionInput)
  @IsOptional()
  descriptions?: CreateEmergencyDescriptionInput[];
}
