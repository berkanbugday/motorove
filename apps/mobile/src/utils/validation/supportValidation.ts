import {z} from 'zod';
import {TFunction} from 'i18next';

/**
 * Creates support request validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing support validation schemas
 */
export const supportSchemas = (t: TFunction) => {
  // Support request form schema
  const supportRequestSchema = z.object({
    category: z
      .string({required_error: t('validation.support.category.required')})
      .nonempty(t('validation.support.category.required'))
      .min(1, t('validation.support.category.select')),
    subject: z
      .string({required_error: t('validation.support.subject.required')})
      .nonempty(t('validation.support.subject.required'))
      .min(1, t('validation.support.subject.required')),
    message: z
      .string({required_error: t('validation.support.message.required')})
      .nonempty(t('validation.support.message.required'))
      .min(10, t('validation.support.message.min_length')),
  });

  return {
    supportRequestSchema,
  };
};

export type SupportFormValues = z.infer<
  ReturnType<typeof supportSchemas>['supportRequestSchema']
>;
