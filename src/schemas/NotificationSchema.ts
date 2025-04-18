import { z } from 'zod';

export const NotificationSchema = z.object({
  id: z.string().optional(),

  message: z.string(),
  type: z.string(),
  taskId: z.string().uuid(),
  isRead: z.boolean().optional(),
  timestamp: z.date().optional(),
});
export type Notification = z.infer<typeof NotificationSchema>;