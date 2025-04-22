import {z} from 'zod';

// Login form schema
export const loginSchema = z.object({
  email: z
    .string({required_error: 'Email is required'})
    .email('Email is invalid'),
  password: z
    .string({required_error: 'Password is required'})
    .min(6, 'Password must be at least 6 characters'),
});

export type LoginFormValues = z.infer<typeof loginSchema>;

// Forgot password form schema
export const forgotPasswordSchema = z.object({
  email: z
    .string({required_error: 'Email is required'})
    .email('Email is invalid'),
});

export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

// Signup form schema
export const signupSchema = z
  .object({
    fullName: z
      .string({required_error: 'Full name is required'})
      .min(2, 'Full name must be at least 2 characters'),
    email: z
      .string({required_error: 'Email is required'})
      .email('Email is invalid'),
    password: z
      .string({required_error: 'Password is required'})
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string({required_error: 'Confirm password is required'})
      .min(6, 'Confirm password must be at least 6 characters'),
    agreeToTerms: z.boolean().refine(val => val === true, {
      message: 'You must agree to the Terms of Service and Privacy Policy',
    }),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

export type SignupFormValues = z.infer<typeof signupSchema>;

// Account setup form schema
export const accountSetupSchema = z.object({
  username: z
    .string({required_error: 'Username is required'})
    .min(3, 'Username must be at least 3 characters')
    .max(30, 'Username must be at most 30 characters')
    .regex(
      /^[a-zA-Z0-9._]+$/,
      'Username can only contain letters, numbers, dots and underscores',
    ),
  bio: z.string().max(150, 'Bio cannot exceed 150 characters').optional(),
  phoneNumber: z
    .string()
    .regex(/^\+?[0-9]{10,15}$/, 'Please enter a valid phone number')
    .optional(),
  birthDate: z
    .date({invalid_type_error: 'Please select a valid date'})
    .min(new Date(1900, 0, 1), 'Date is too far in the past')
    .max(new Date(), 'Date cannot be in the future')
    .optional(),
  profilePhotoUrl: z.string().optional(),
});

export type AccountSetupFormValues = z.infer<typeof accountSetupSchema>;
