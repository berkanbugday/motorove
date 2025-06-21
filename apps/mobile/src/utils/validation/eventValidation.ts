import {z} from 'zod';

// Event creation form schema
export const createEventSchema = z.object({
  title: z
    .string({required_error: 'Title is required'})
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string({required_error: 'Description is required'})
    .min(10, 'Description must be at least 10 characters')
    .max(1000, 'Description cannot exceed 1000 characters'),
  location: z
    .string({required_error: 'Location is required'})
    .min(3, 'Location must be at least 3 characters')
    .max(200, 'Location cannot exceed 200 characters'),
  date: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  time: z.date({
    required_error: 'Time is required',
    invalid_type_error: 'Invalid time format',
  }),
  endDate: z
    .date({
      invalid_type_error: 'Invalid date format',
    })
    .optional(),
  endTime: z
    .date({
      invalid_type_error: 'Invalid end time format',
    })
    .optional(),
  eventType: z
    .string({required_error: 'Event type is required'})
    .min(1, 'Please select an event type'),
  maxParticipants: z
    .string()
    .transform(val => (val === '' ? null : val))
    .refine(val => val === null || Number.isInteger(Number(val)), {
      message: 'Maximum participants must be a number',
    })
    .refine(val => val === null || Number(val) >= 2, {
      message: 'Minimum 2 participants required',
    })
    .refine(val => val === null || Number(val) <= 1000, {
      message: 'Maximum 1000 participants allowed',
    })
    .nullable()
    .optional(),
  cover: z.string().nullable().optional(),
  isPrivate: z.boolean().default(false),
  invitedGroups: z.array(z.string()).optional().default([]),

  // Ride/camping specific fields
  routeDescription: z.string().optional(),
  roadType: z.string().optional(),
  difficulty: z.string().optional(),
  restStops: z.string().optional(),
  overnightInfo: z.string().optional(),
  equipmentChecklist: z.string().optional(),

  // Workshop specific fields
  instructorInfo: z.string().optional(),
  topicsCovered: z.string().optional(),
  experienceLevel: z.string().optional(),
  price: z.string().optional(),

  // Track day/race specific fields
  trackLocation: z.string().optional(),
  licenseRequired: z.boolean().optional().default(false),
  timeSlots: z.string().optional(),
  safetyRequirements: z.string().optional(),
});

export const updateEventSchema = createEventSchema.extend({
  id: z.string(),
});

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
