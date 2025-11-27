import { Field, InputType } from '@nestjs/graphql';
import { IsNotEmpty, IsString, IsEnum, IsOptional } from 'class-validator';
import { ContentType } from '../../enums/models/content-type.enum';
import { ReportReason } from '../../enums/models/report-reason.enum';
import { ICreateContentReport } from '@motorove/shared';

@InputType()
export class CreateContentReportInput implements ICreateContentReport {
  @Field(() => ContentType)
  @IsNotEmpty()
  @IsEnum(ContentType)
  contentType: ContentType;

  @Field(() => String)
  @IsNotEmpty()
  @IsString()
  contentId: string;

  @Field(() => ReportReason)
  @IsNotEmpty()
  @IsEnum(ReportReason)
  reason: ReportReason;

  @Field(() => String, { nullable: true })
  @IsOptional()
  @IsString()
  description?: string;
}
