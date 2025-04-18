import { z } from 'zod';

export const CommentSchema = z.object({
  id: z.string().uuid().optional(),
  content: z.string().min(1),
  timestamp: z.date().optional(),
});

export const CreateCommentSchema = CommentSchema.omit({ id: true, timestamp: true })

export const UpdateCommentSchema = CommentSchema.pick({content: true})