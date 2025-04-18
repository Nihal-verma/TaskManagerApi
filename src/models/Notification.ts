export interface Notification {
  id: string;
  userId: string;
  message: string;
  type: string;
  taskId: string;
  isRead: boolean;
  timestamp: Date;
}