import {z} from 'zod';
import {TFunction} from 'i18next';

/**
 * Creates content report validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing content report validation schemas
 */
export const contentReportSchemas = (t: TFunction) => {
  // Content report form schema
  const contentReportSchema = z.object({
    contentType: z
      .string({
        required_error: t('validation.content_report.content_type.required'),
      })
      .nonempty(t('validation.content_report.content_type.required'))
      .min(1, t('validation.content_report.content_type.select')),
    reason: z
      .string({required_error: t('validation.content_report.reason.required')})
      .nonempty(t('validation.content_report.reason.required'))
      .min(1, t('validation.content_report.reason.select')),
    description: z
      .string()
      .optional()
      .refine(
        val => !val || val.length >= 10,
        t('validation.content_report.description.min_length'),
      )
      .refine(
        val => !val || val.length <= 500,
        t('validation.content_report.description.max_length'),
      ),
  });

  return {
    contentReportSchema,
  };
};

export type ContentReportFormValues = z.infer<
  ReturnType<typeof contentReportSchemas>['contentReportSchema']
>;
