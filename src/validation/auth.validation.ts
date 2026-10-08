import { z } from 'zod';

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email({ message: 'Invalid email address' }),
    password: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
    firstName: z.string().trim().optional(),
    lastName: z.string().trim().optional(),
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email({ message: 'Invalid email address' }),
    password: z.string().min(1, { message: 'Password is required' }),
  }),
});

export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z.string().trim().email({ message: 'Invalid email address' }),
  }),
});

export const resetPasswordSchema = z.object({
  body: z.object({
    token: z.string().min(1, { message: 'Reset token is required' }),
    newPassword: z.string().min(6, { message: 'Password must be at least 6 characters long' }),
  }),
});

export const googleLoginSchema = z.object({
  body: z
    .object({
      idToken: z.string().trim().optional(),
      credential: z.string().trim().optional(),
      accessToken: z.string().trim().optional(),
      email: z.string().trim().email({ message: 'Invalid email address' }).optional(),
      firstName: z.string().trim().optional(),
      lastName: z.string().trim().optional(),
    })
    .refine(
      (data) => Boolean(data.idToken || data.credential || data.accessToken || data.email),
      {
        message: 'Must provide either idToken, credential, accessToken, or email',
      }
    ),
});

