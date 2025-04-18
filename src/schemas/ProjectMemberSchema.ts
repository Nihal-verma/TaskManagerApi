import { z } from 'zod';

export const ProjectMemberCreateSchema = z.object({
  id: z.string().optional(),
  role: z.enum(['admin', 'editor', 'viewer']),
});

export const ProjectMemberUpdateSchema = z.object({
  role: z.enum(['admin', 'editor', 'viewer']),
});