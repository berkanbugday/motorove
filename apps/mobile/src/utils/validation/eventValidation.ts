import {z} from 'zod';

// Base schema definition
const eventBaseSchema = z.object({
  title: z
    .string({required_error: 'Title is required'})
    .nonempty('Title is required')
    .min(3, 'Title must be at least 3 characters')
    .max(100, 'Title must be at most 100 characters'),
  description: z
    .string()
    .max(1000, 'Description cannot exceed 1000 characters')
    .optional()
    .nullable(),
  meetingPoint: z
    .string()
    .max(200, 'Meeting point cannot exceed 200 characters')
    .optional()
    .nullable(),
  startLocation: z
    .string()
    .max(200, 'Start point cannot exceed 200 characters')
    .optional()
    .nullable(),
  startDate: z.date({
    required_error: 'Date is required',
    invalid_type_error: 'Invalid date format',
  }),
  startTime: z.date({
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
  images: z.array(z.string()).nullable().optional(),
  isPrivate: z.boolean().default(false),
  invitedGroups: z.array(z.string()).optional().default([]),
  invitedUsers: z.array(z.string()).optional().default([]),

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
});

// Event creation form schema with dynamic validation
export const createEventSchema = eventBaseSchema.superRefine((data, ctx) => {
  // Validate end date is not before start date
  if (data.endDate && data.startDate) {
    const startDateOnly = new Date(
      data.startDate.getFullYear(),
      data.startDate.getMonth(),
      data.startDate.getDate(),
    );

    const endDateOnly = new Date(
      data.endDate.getFullYear(),
      data.endDate.getMonth(),
      data.endDate.getDate(),
    );

    if (endDateOnly < startDateOnly) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End date cannot be before start date',
        path: ['endDate'],
      });
    }
  }

  // Validate end time is not before start time when on same day
  if (data.endTime && data.startTime && data.endDate && data.startDate) {
    const startDateOnly = new Date(
      data.startDate.getFullYear(),
      data.startDate.getMonth(),
      data.startDate.getDate(),
    );

    const endDateOnly = new Date(
      data.endDate.getFullYear(),
      data.endDate.getMonth(),
      data.endDate.getDate(),
    );

    // If on the same day, check if end time is before start time
    if (
      startDateOnly.getTime() === endDateOnly.getTime() &&
      data.endTime < data.startTime
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'End time cannot be before start time',
        path: ['endTime'],
      });
    }
  }
});

export const updateEventSchema = eventBaseSchema
  .extend({
    id: z.string(),
  })
  .superRefine((data, ctx) => {
    // Validate end date is not before start date
    if (data.endDate && data.startDate) {
      const startDateOnly = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate(),
      );

      const endDateOnly = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate(),
      );

      if (endDateOnly < startDateOnly) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End date cannot be before start date',
          path: ['endDate'],
        });
      }
    }

    // Validate end time is not before start time when on same day
    if (data.endTime && data.startTime && data.endDate && data.startDate) {
      const startDateOnly = new Date(
        data.startDate.getFullYear(),
        data.startDate.getMonth(),
        data.startDate.getDate(),
      );

      const endDateOnly = new Date(
        data.endDate.getFullYear(),
        data.endDate.getMonth(),
        data.endDate.getDate(),
      );

      // If on the same day, check if end time is before start time
      if (
        startDateOnly.getTime() === endDateOnly.getTime() &&
        data.endTime < data.startTime
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'End time cannot be before start time',
          path: ['endTime'],
        });
      }
    }
  });

export type CreateEventFormValues = z.infer<typeof createEventSchema>;
export type UpdateEventFormValues = z.infer<typeof updateEventSchema>;
