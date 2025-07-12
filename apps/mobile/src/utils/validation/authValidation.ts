import {z} from 'zod';
import {TFunction} from 'i18next';

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
    username: z
      .string({required_error: t('validation.username.required')})
      .nonempty(t('validation.username.required'))
      .min(3, t('validation.username.minLength'))
      .max(30, t('validation.username.maxLength'))
      .regex(/^[a-zA-Z0-9._]+$/, t('validation.username.invalidFormat')),
    userType: z
      .string({required_error: t('validation.userType.required')})
      .nonempty(t('validation.userType.required'))
      .min(1, t('validation.userType.select')),
    bio: z.string().max(150, t('validation.bio.maxLength')).optional(),
    phoneNumber: z
      .string()
      .regex(/^\+?[0-9]{10,15}$/, t('validation.phoneNumber.invalid'))
      .optional(),
    birthDate: z
      .date({invalid_type_error: t('validation.birthDate.invalid')})
      .min(new Date(1900, 0, 1), t('validation.birthDate.tooOld'))
      .max(new Date(), t('validation.birthDate.future'))
      .optional(),
    profilePhotoUrl: z.string().optional(),
    interests: z.array(z.string()).optional(),
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
