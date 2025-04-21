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

// Registration form schema
export const registrationSchema = z
  .object({
    name: z
      .string({required_error: 'Name is required'})
      .min(1, 'Name is required'),
    email: z
      .string({required_error: 'Email is required'})
      .email('Email is invalid'),
    password: z
      .string({required_error: 'Password is required'})
      .min(6, 'Password must be at least 6 characters'),
    confirmPassword: z
      .string({required_error: 'Please confirm your password'})
      .min(1, 'Please confirm your password'),
  })
  .refine(data => data.password === data.confirmPassword, {
    message: 'Passwords do not match',
    path: ['confirmPassword'],
  });

export type RegistrationFormValues = z.infer<typeof registrationSchema>;
