import {z} from 'zod';
import {TFunction} from 'i18next';
import {
  Gender,
  RidingStyle,
  Interest,
  SocialMediaPlatform,
} from '@motorove/shared/enums';

/**
 * Creates user profile validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing profile validation schemas
 */
export const profileSchemas = (t: TFunction) => {
  // Social media URL validation schema
  const socialMediaSchema = z.object({
    id: z.string().optional(),
    platform: z.nativeEnum(SocialMediaPlatform),
    username: z
      .string()
      .min(1, t('validation.profile.social_media.username_required'))
      .max(200, t('validation.profile.social_media.username_max_length')),
  });

  // Update profile form schema
  const updateProfileSchema = z.object({
    firstName: z
      .string({required_error: t('validation.firstName.required')})
      .nonempty(t('validation.firstName.required'))
      .min(2, t('validation.firstName.min_length'))
      .max(50, t('validation.profile.firstName.max_length')),
    lastName: z
      .string({required_error: t('validation.lastName.required')})
      .nonempty(t('validation.lastName.required'))
      .min(2, t('validation.lastName.min_length'))
      .max(50, t('validation.profile.lastName.max_length')),
    bio: z
      .string()
      .max(300, t('validation.bio.max_length'))
      .optional()
      .nullable(),
    gender: z
      .nativeEnum(Gender, {
        errorMap: () => ({message: t('validation.gender.invalid')}),
      })
      .optional()
      .nullable(),
    dateOfBirth: z
      .date({
        errorMap: () => ({message: t('validation.dateOfBirth.invalid')}),
      })
      .refine(
        date => {
          if (!date) {
            return true;
          }
          const minDate = new Date();
          minDate.setFullYear(minDate.getFullYear() - 85);
          return date >= minDate;
        },
        {message: t('validation.dateOfBirth.too_old')},
      )
      .refine(
        date => {
          if (!date) {
            return true;
          }
          const maxDate = new Date();
          maxDate.setFullYear(maxDate.getFullYear() - 15);
          return date <= maxDate;
        },
        {message: t('validation.dateOfBirth.future')},
      )
      .optional()
      .nullable(),
    ridingStyles: z
      .array(z.nativeEnum(RidingStyle))
      .max(3, t('validation.profile.riding_styles.max'))
      .optional()
      .nullable(),
    interests: z
      .array(z.nativeEnum(Interest))
      .max(3, t('validation.profile.interests.max'))
      .optional()
      .nullable(),
    avatar: z.string().optional().nullable(),
    socialMediaProfiles: z
      .array(socialMediaSchema)
      .max(6, t('validation.profile.social_media.max'))
      .optional()
      .nullable(),
  });

  return {
    updateProfileSchema,
  };
};

export type UpdateProfileFormValues = z.infer<
  ReturnType<typeof profileSchemas>['updateProfileSchema']
>;
