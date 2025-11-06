import {z} from 'zod';
import {TFunction} from 'i18next';
import {Gender, Interest, RidingStyle} from '@motorove/shared';

/**
 * Creates validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing all authentication validation schemas
 */
export const authSchemas = (t: TFunction) => {
  // Signin form schema
  const signinSchema = z.object({
    email: z
      .string({required_error: t('validation.email.required')})
      .nonempty(t('validation.email.required'))
      .email(t('validation.email.invalid')),
    password: z
      .string({required_error: t('validation.password.required')})
      .nonempty(t('validation.password.required'))
      .min(6, t('validation.password.min_length'))
      .regex(/^\S*$/, t('validation.password.no_spaces')),
  });

  // Reset password form schema
  const resetPasswordSchema = z.object({
    email: z
      .string({required_error: t('validation.email.required')})
      .nonempty(t('validation.email.required'))
      .email(t('validation.email.invalid')),
  });

  // Signup form schema
  const signupSchema = z.object({
    firstName: z
      .string({required_error: t('validation.firstName.required')})
      .nonempty(t('validation.firstName.required'))
      .min(2, t('validation.firstName.min_length')),
    lastName: z
      .string({required_error: t('validation.lastName.required')})
      .nonempty(t('validation.lastName.required'))
      .min(2, t('validation.lastName.min_length')),
    email: z
      .string({required_error: t('validation.email.required')})
      .nonempty(t('validation.email.required'))
      .email(t('validation.email.invalid')),
    password: z
      .string({required_error: t('validation.password.required')})
      .nonempty(t('validation.password.required'))
      .min(6, t('validation.password.min_length'))
      .regex(/^\S*$/, t('validation.password.no_spaces')),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('validation.agreeToTerms.required'),
    }),
  });

  // Account setup form schema
  const accountSetupSchema = z.object({
    dateOfBirth: z
      .date({invalid_type_error: t('validation.dateOfBirth.invalid')})
      .min(
        new Date(new Date().getFullYear() - 80, 0, 1),
        t('validation.dateOfBirth.too_old'),
      )
      .max(
        new Date(new Date().getFullYear() - 13, 0, 1),
        t('validation.dateOfBirth.future'),
      )
      .nullable()
      .optional(),
    gender: z
      .nativeEnum(Gender, {
        required_error: t('validation.gender.required'),
        invalid_type_error: t('validation.gender.invalid'),
      })
      .nullable()
      .optional(),
    city: z
      .string({required_error: t('validation.city.required')})
      .nonempty(t('validation.city.required')),
    ridingStyles: z.array(z.nativeEnum(RidingStyle)).optional(),
    interests: z.array(z.nativeEnum(Interest)).optional(),
    avatar: z.string().nullable().optional(),
  });

  // Change email form schema
  const changeEmailSchema = z
    .object({
      email: z.string().email(),
      newEmail: z
        .string({required_error: t('validation.email.required')})
        .nonempty(t('validation.email.required'))
        .email(t('validation.email.invalid')),
      confirmEmail: z
        .string({required_error: t('validation.email.required')})
        .nonempty(t('validation.email.required'))
        .email(t('validation.email.invalid')),
    })
    .refine(data => data.newEmail === data.confirmEmail, {
      message: t('validation.email.mismatch'),
      path: ['confirmEmail'],
    });

  // Change password form schema
  const changePasswordSchema = z
    .object({
      newPassword: z
        .string({required_error: t('validation.password.required')})
        .nonempty(t('validation.password.required'))
        .min(6, t('validation.password.min_length'))
        .regex(/^\S*$/, t('validation.password.no_spaces')),
      confirmPassword: z
        .string({required_error: t('validation.password.required')})
        .nonempty(t('validation.password.required'))
        .min(6, t('validation.password.min_length'))
        .regex(/^\S*$/, t('validation.password.no_spaces')),
    })
    .refine(data => data.newPassword === data.confirmPassword, {
      message: t('validation.password.mismatch'),
      path: ['confirmPassword'],
    });

  return {
    signinSchema,
    resetPasswordSchema,
    signupSchema,
    accountSetupSchema,
    changeEmailSchema,
    changePasswordSchema,
  };
};

// For backward compatibility, export the types
export type SigninFormValues = z.infer<
  ReturnType<typeof authSchemas>['signinSchema']
>;
export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof authSchemas>['resetPasswordSchema']
>;
export type SignupFormValues = z.infer<
  ReturnType<typeof authSchemas>['signupSchema']
>;
export type AccountSetupFormValues = z.infer<
  ReturnType<typeof authSchemas>['accountSetupSchema']
>;
export type ChangeEmailFormValues = z.infer<
  ReturnType<typeof authSchemas>['changeEmailSchema']
>;
export type ChangePasswordFormValues = z.infer<
  ReturnType<typeof authSchemas>['changePasswordSchema']
>;
