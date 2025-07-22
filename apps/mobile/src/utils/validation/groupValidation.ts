import {z} from 'zod';
import {TFunction} from 'i18next';

/**
 * Creates group validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing group validation schemas
 */
export const groupSchemas = (t: TFunction) => {
  // Group creation form schema
  const createGroupSchema = z.object({
    name: z
      .string({required_error: t('validation.group.name.required')})
      .nonempty(t('validation.group.name.required'))
      .min(3, t('validation.group.name.min_length'))
      .max(100, t('validation.group.name.max_length')),
    description: z
      .string({required_error: t('validation.group.description.required')})
      .nonempty(t('validation.group.description.required'))
      .min(10, t('validation.group.description.min_length'))
      .max(500, t('validation.group.description.max_length')),
    city: z
      .string({required_error: t('validation.group.city.required')})
      .nonempty(t('validation.group.city.required'))
      .min(1, t('validation.group.city.select')),
    privacy: z
      .string({required_error: t('validation.group.privacy.required')})
      .nonempty(t('validation.group.privacy.required'))
      .min(1, t('validation.group.privacy.select')),
    membersCapacity: z
      .string()
      .transform(val => (val === '' ? null : val))
      .refine(val => val === null || Number.isInteger(Number(val)), {
        message: t('validation.group.members_capacity.number'),
      })
      .refine(val => val === null || Number(val) > 0, {
        message: t('validation.group.members_capacity.positive'),
      })
      .nullable()
      .optional(),
    tags: z
      .array(z.string())
      .min(1, t('validation.group.tags.min'))
      .max(3, t('validation.group.tags.max')),
    logo: z
      .string({required_error: t('validation.group.logo.required')})
      .nonempty(t('validation.group.logo.required')),
    cover: z.string().nullable().optional(),
  });

  const updateGroupSchema = createGroupSchema.extend({
    id: z.string(),
  });

  return {
    createGroupSchema,
    updateGroupSchema,
  };
};

export type CreateGroupFormValues = z.infer<
  ReturnType<typeof groupSchemas>['createGroupSchema']
>;
export type UpdateGroupFormValues = z.infer<
  ReturnType<typeof groupSchemas>['updateGroupSchema']
>;
