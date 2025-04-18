import { z } from 'zod';

export const createTaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  estimatedTime: z.number().optional(),
  attachmentPath: z.string().optional(),
  recurrence: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
});

export const updateTaskSchema = z.object({
  id: z.string().optional(),
  title: z.string().optional(),
  description: z.string().optional(),
  status: z.string().optional(),
  dueDate: z.string().optional(),
  priority: z.string().optional(),
  estimatedTime: z.number().optional(),
  attachmentPath: z.string().optional(),
  recurrence: z.string().optional(),
  recurrenceEndDate: z.string().optional(),
  dependencies: z.array(z.string()).optional(),
  assignedTo: z.string().optional(),
});