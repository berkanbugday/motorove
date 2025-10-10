import {z} from 'zod';
import {TFunction} from 'i18next';
import {EventType} from '@motorove/shared';

/**
 * Creates event validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing event validation schemas
 */
export const eventSchemas = (t: TFunction) => {
  // Base schema definition
  const eventBaseSchema = z.object({
    title: z
      .string({required_error: t('validation.event.title.required')})
      .nonempty(t('validation.event.title.required'))
      .min(3, t('validation.event.title.min_length'))
      .max(100, t('validation.event.title.max_length')),
    description: z
      .string({required_error: t('validation.event.description.required')})
      .nonempty(t('validation.event.description.required'))
      .max(1000, t('validation.event.description.max_length')),
    meetingPoint: z
      .string()
      .max(200, t('validation.event.meeting_point.max_length'))
      .optional()
      .nullable(),
    startLocation: z
      .string()
      .max(200, t('validation.event.start_location.max_length'))
      .optional(),
    finishLocation: z
      .string()
      .max(200, t('validation.event.finish_location.max_length'))
      .optional(),
    startDate: z.date({
      required_error: t('validation.event.start_date.required'),
      invalid_type_error: t('validation.event.start_date.invalid'),
    }),
    startTime: z.date({
      required_error: t('validation.event.start_time.required'),
      invalid_type_error: t('validation.event.start_time.invalid'),
    }),
    endDate: z
      .date({
        invalid_type_error: t('validation.event.end_date.invalid'),
      })
      .optional(),
    endTime: z
      .date({
        invalid_type_error: t('validation.event.end_time.invalid'),
      })
      .optional(),
    eventType: z
      .nativeEnum(EventType, {
        required_error: t('validation.event.event_type.required'),
      })
      .or(
        z
          .string()
          .nonempty(t('validation.event.event_type.required'))
          .min(1, t('validation.event.event_type.select')),
      ),
    maxParticipants: z
      .string()
      .transform(val => (val === '' ? null : val))
      .refine(val => val === null || Number.isInteger(Number(val)), {
        message: t('validation.event.max_participants.number'),
      })
      .refine(val => val === null || Number(val) >= 2, {
        message: t('validation.event.max_participants.min'),
      })
      .refine(val => val === null || Number(val) <= 1000, {
        message: t('validation.event.max_participants.max'),
      })
      .nullable()
      .optional(),
    images: z
      .array(z.string().nonempty())
      .min(1, t('validation.event.images.required')),
    isPrivate: z.boolean().default(false),
    invitedGroups: z.array(z.string()).optional().default([]),
    invitedUsers: z.array(z.string()).optional().default([]),

    // Ride/camping specific fields
    routeDescription: z.string().optional(),
    roadType: z.string().optional(), // This is conditionally required in superRefine
    difficultyLevel: z.string().optional(),
    restStops: z.string().optional(),
    campingInfo: z.string().optional(),
    equipmentChecklist: z.string().optional(),

    // Workshop specific fields
    instructorInfo: z.string().optional(),
    topicsCovered: z.string().optional(),
    experienceLevel: z.string().optional(),
    price: z.string().optional(),
  });

  // Event creation form schema with dynamic validation
  const createEventSchema = eventBaseSchema.superRefine((data, ctx) => {
    // Validate roadType is required for ride and camping event types
    const rideOrCampingEventTypes = [
      EventType.SOLO_RIDE,
      EventType.GROUP_RIDE,
      EventType.CAMPING_RIDE,
      EventType.SOCIAL_RESPONSIBILITY,
    ];

    if (rideOrCampingEventTypes.includes(data.eventType as EventType)) {
      if (!data.startLocation || data.startLocation.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.start_location.required'),
          path: ['startLocation'],
        });
      }

      if (!data.finishLocation || data.finishLocation.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.finish_location.required'),
          path: ['finishLocation'],
        });
      }

      if (!data.roadType || data.roadType.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.road_type.required'),
          path: ['roadType'],
        });
      }
      if (!data.difficultyLevel || data.difficultyLevel.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.difficulty_level.required'),
          path: ['difficultyLevel'],
        });
      }
      if (data.eventType === EventType.CAMPING_RIDE) {
        if (!data.campingInfo || data.campingInfo.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.event.camping_info.required'),
            path: ['campingInfo'],
          });
        }
      }
    }

    // Validate meetingPoint is required for MEET_UP event type
    if (
      data.eventType === EventType.MEET_UP ||
      data.eventType === EventType.MOTOFEST
    ) {
      if (!data.meetingPoint || data.meetingPoint.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.meeting_point.required'),
          path: ['meetingPoint'],
        });
      }
    }

    if (data.eventType === EventType.TRAINING) {
      if (!data.instructorInfo || data.instructorInfo.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.instructor_info.required'),
          path: ['instructorInfo'],
        });
      }
      if (!data.topicsCovered || data.topicsCovered.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.topics_covered.required'),
          path: ['topicsCovered'],
        });
      }
      if (!data.experienceLevel || data.experienceLevel.trim() === '') {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.experience_level.required'),
          path: ['experienceLevel'],
        });
      }
    }

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
          message: t('validation.event.end_date.not_before_start'),
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
          message: t('validation.event.end_time.not_before_start'),
          path: ['endTime'],
        });
      }
    }
  });

  const updateEventSchema = eventBaseSchema
    .extend({
      id: z.string(),
    })
    .superRefine((data, ctx) => {
      // Validate roadType is required for ride and camping event types
      const rideOrCampingEventTypes = [
        EventType.SOLO_RIDE,
        EventType.GROUP_RIDE,
        EventType.CAMPING_RIDE,
        EventType.SOCIAL_RESPONSIBILITY,
      ];
      if (
        rideOrCampingEventTypes.includes(data.eventType as EventType) &&
        (!data.roadType || data.roadType.trim() === '')
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: t('validation.event.road_type.required_for_type'),
          path: ['roadType'],
        });
      }

      // Validate meetingPoint is required for MEET_UP event type
      if (data.eventType === EventType.MEET_UP) {
        if (!data.meetingPoint || data.meetingPoint.trim() === '') {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: t('validation.event.meeting_point.required'),
            path: ['meetingPoint'],
          });
        }
      }

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
            message: t('validation.event.end_time.not_before_start'),
            path: ['endTime'],
          });
        }
      }
    });

  return {
    createEventSchema,
    updateEventSchema,
  };
};

// For backward compatibility, export the types
export type CreateEventFormValues = z.infer<
  ReturnType<typeof eventSchemas>['createEventSchema']
>;
export type UpdateEventFormValues = z.infer<
  ReturnType<typeof eventSchemas>['updateEventSchema']
>;
