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
