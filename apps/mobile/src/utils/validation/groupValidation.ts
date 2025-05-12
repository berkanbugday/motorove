import {z} from 'zod';

// Group creation form schema
export const createGroupSchema = z.object({
  name: z
    .string({required_error: 'Group name is required'})
    .min(3, 'Group name must be at least 3 characters')
    .max(100, 'Group name must be at most 100 characters'),
  description: z
    .string({required_error: 'Description is required'})
    .min(10, 'Description must be at least 10 characters')
    .max(500, 'Description cannot exceed 500 characters'),
  city: z
    .string({required_error: 'City is required'})
    .min(1, 'Please select a city'),
  privacy: z
    .string({required_error: 'Privacy setting is required'})
    .min(1, 'Please select a privacy setting'),
  membersCapacity: z
    .string()
    .transform(val => (val === '' ? null : val))
    .refine(val => val === null || Number.isInteger(Number(val)), {
      message: 'Members capacity must be a number',
    })
    .refine(val => val === null || Number(val) > 0, {
      message: 'Members capacity must be a positive number',
    })
    .nullable()
    .optional(),
  tags: z
    .array(z.string())
    .min(1, 'Please select at least 1 tag')
    .max(3, 'You can select up to 3 tags'),
  logo: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
});

export const updateGroupSchema = createGroupSchema.extend({
  id: z.string(),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
export type UpdateGroupFormValues = z.infer<typeof updateGroupSchema>;
