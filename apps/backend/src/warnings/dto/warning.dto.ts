import { Field, ObjectType } from '@nestjs/graphql';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { IWarning } from '@motorove/shared';
import { WarningType } from '../../enums/models/warning-type.enum';
import { ApprovalStatus } from '../../enums/models/approval-status.enum';
import { WarningDescriptionDto } from './warning-description.dto';
import { WarningAddressDto } from './warning-address.dto';
import { BaseDto } from '../../core/models/base.dto';

@ObjectType()
export class WarningDto extends BaseDto implements IWarning {
  @Field(() => WarningType)
  @IsEnum(WarningType)
  type: WarningType;

  @Field(() => ApprovalStatus)
  @IsEnum(ApprovalStatus)
  status: ApprovalStatus;

  @Field(() => [WarningDescriptionDto], { nullable: true })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WarningDescriptionDto)
  descriptions?: WarningDescriptionDto[];

  @Field(() => [WarningAddressDto])
  @ValidateNested({ each: true })
  @Type(() => WarningAddressDto)
  addresses: WarningAddressDto[];
}
