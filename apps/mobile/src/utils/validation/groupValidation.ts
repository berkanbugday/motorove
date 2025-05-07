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
    .number({invalid_type_error: 'Members capacity must be a number'})
    .int('Members capacity must be a whole number')
    .positive('Members capacity must be a positive number')
    .nullable()
    .optional(),
  tags: z
    .array(z.string())
    .min(1, 'Please select at least 1 tag')
    .max(3, 'You can select up to 3 tags'),
  logo: z.string().nullable().optional(),
  cover: z.string().nullable().optional(),
});

export type CreateGroupFormValues = z.infer<typeof createGroupSchema>;
