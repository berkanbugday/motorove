import {z} from 'zod';
import {TFunction} from 'i18next';
import {Gender} from '@motorove/shared/enums';

/**
 * Creates validation schemas with translated error messages
 * @param t Translation function
 * @returns Object containing all authentication validation schemas
 */
export const createAuthSchemas = (t: TFunction) => {
  // Signin form schema
  const signinSchema = z.object({
    email: z
      .string({required_error: t('validation.email.required')})
      .nonempty(t('validation.email.required'))
      .email(t('validation.email.invalid')),
    password: z
      .string({required_error: t('validation.password.required')})
      .nonempty(t('validation.password.required'))
      .min(6, t('validation.password.minLength'))
      .regex(/^\S*$/, t('validation.password.noSpaces')),
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
      .min(2, t('validation.firstName.minLength')),
    lastName: z
      .string({required_error: t('validation.lastName.required')})
      .nonempty(t('validation.lastName.required'))
      .min(2, t('validation.lastName.minLength')),
    email: z
      .string({required_error: t('validation.email.required')})
      .nonempty(t('validation.email.required'))
      .email(t('validation.email.invalid')),
    password: z
      .string({required_error: t('validation.password.required')})
      .nonempty(t('validation.password.required'))
      .min(6, t('validation.password.minLength'))
      .regex(/^\S*$/, t('validation.password.noSpaces')),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: t('validation.agreeToTerms.required'),
    }),
  });

  // Account setup form schema
  const accountSetupSchema = z.object({
    dateOfBirth: z
      .date({invalid_type_error: t('validation.dateOfBirth.invalid')})
      .min(new Date(1950, 0, 1), t('validation.dateOfBirth.tooOld'))
      .max(new Date(), t('validation.dateOfBirth.future')),
    gender: z.nativeEnum(Gender, {
      required_error: t('validation.gender.required'),
      invalid_type_error: t('validation.gender.invalid'),
    }),
    city: z
      .string({required_error: t('validation.city.required')})
      .nonempty(t('validation.city.required')),
  });

  return {
    signinSchema,
    resetPasswordSchema,
    signupSchema,
    accountSetupSchema,
  };
};

// For backward compatibility, export the types
export type SigninFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>['signinSchema']
>;
export type ResetPasswordFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>['resetPasswordSchema']
>;
export type SignupFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>['signupSchema']
>;
export type AccountSetupFormValues = z.infer<
  ReturnType<typeof createAuthSchemas>['accountSetupSchema']
>;
