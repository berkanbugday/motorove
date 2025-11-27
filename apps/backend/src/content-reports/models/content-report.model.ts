import { ObjectType, Field, ID } from '@nestjs/graphql';
import { ContentType } from '../../enums/models/content-type.enum';
import { ReportReason } from '../../enums/models/report-reason.enum';
import { ReportStatus } from '../../enums/models/report-status.enum';
import { User } from '../../users/models/user.model';

@ObjectType()
export class ContentReport {
  @Field(() => ID)
  id: string;

  @Field(() => ContentType)
  contentType: ContentType;

  @Field(() => String)
  contentId: string;

  @Field(() => ReportReason)
  reason: ReportReason;

  @Field(() => String, { nullable: true })
  description?: string;

  @Field(() => User)
  createdBy: User;

  @Field(() => ReportStatus)
  status: ReportStatus;

  @Field(() => Date)
  createdAt: Date;

  @Field(() => Date)
  updatedAt: Date;
}
