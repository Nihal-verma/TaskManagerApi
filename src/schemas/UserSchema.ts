import { z } from 'zod';

export const CreateUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }),
  username:z.string().min(1, { message: 'User Name is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  password: z.string().min(6, { message: 'Password must be at least 6 characters' }),
  avatarPath: z.string().optional(),
});

export const UpdateUserSchema = z.object({
  name: z.string().min(1, { message: 'Name is required' }).optional(),
  email: z.string().email({ message: 'Invalid email address' }).optional(),
  avatarPath: z.string().optional(),
});