import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IEmergency } from '@motorove/shared';
import { EmergencyType } from '../../enums/models/emergency-type.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { EmergencyDescriptionDto } from './emergency-description.dto';
import { EmergencyAddressDto } from './emergency-address.dto';
import { BaseDto } from '../../core/models/base.dto';

@ObjectType()
export class EmergencyDto extends BaseDto implements IEmergency {
  @Field(() => EmergencyType)
  @IsEnum(EmergencyType)
  type: EmergencyType;

  @Field(() => ApprovalStatus)
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [EmergencyDescriptionDto], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => EmergencyDescriptionDto)
  descriptions?: EmergencyDescriptionDto[];

  @Field(() => [EmergencyAddressDto])
  @ValidateNested({ each: true })
  @Type(() => EmergencyAddressDto)
  addresses: EmergencyAddressDto[];
}
