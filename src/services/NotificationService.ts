import { Pool } from 'pg';  
import { Notification } from '../models/Notification';
import { userService } from './UserService';
import { v4 as uuidv4 } from 'uuid';
import pool from '../config/db'; 
export class NotificationService {
  async createNotification(userId: string, message: string, type: string, taskId: string): Promise<Notification> {
    const userExists = await userService.findById(userId);
    if (!userExists) {
      throw new Error('User not found');
    }
    const id = uuidv4();
    const timestamp = new Date();
    const notification: Notification = {
      id,
      userId,
      message,
      type,
      taskId,
      isRead: false,
      timestamp,
    };

    const result = await pool.query(
      'INSERT INTO notifications (id, userId, message, type, taskId, isRead, timestamp) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [notification.id, notification.userId, notification.message, notification.type, notification.taskId, notification.isRead, notification.timestamp]
    );
    return result.rows[0];  
  }

  async listNotifications(userId: string): Promise<Notification[]> {
    const result = await pool.query(
      'SELECT * FROM notifications WHERE userId = $1 ORDER BY timestamp DESC',
      [userId]
    );
    return result.rows as Notification[];
  }

  async markAsRead(notificationId: string): Promise<Notification | null> {
    const result = await pool.query(
      'UPDATE notifications SET isRead = true WHERE id = $1 RETURNING *',
      [notificationId]
    );
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as Notification;
  }
}
