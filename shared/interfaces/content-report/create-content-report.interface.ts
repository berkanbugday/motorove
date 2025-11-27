import { ContentType, ReportReason } from "../../enums";

/**
 * Create ContentReport Interface
 * Used for creating new content reports
 */
export interface ICreateContentReport {
  /**
   * Type of content being reported
   */
  contentType: ContentType;

  /**
   * ID of the content this report belongs to
   */
  contentId: string;

  /**
   * Reason for reporting the content
   */
  reason: ReportReason;

  /**
   * Description of the content
   */
  description?: string;
}
