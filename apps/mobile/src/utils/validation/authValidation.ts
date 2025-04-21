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
