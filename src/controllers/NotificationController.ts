import { Request, Response } from 'express';
import { NotificationService } from '../services/NotificationService';
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
export class NotificationController {
    private notificationService: NotificationService;

    constructor() {
        this.notificationService = new NotificationService();
    }

    async createNotification(req: AuthenticatedRequest, res: Response): Promise<void> {
        try {
            const userId = req.user?.userId
            const {message, type, taskId } = req.body;
            const notification = await this.notificationService.createNotification(userId, message, type, taskId);
            res.status(201).json(notification);
        } catch (error: any) {
            res.status(400).json({ error: error.message });
        }
    }

    async listNotifications(req: AuthenticatedRequest, res: Response) {
        try {
            const userId = req.user?.userId;
            if (!userId) {
                return res.status(401).json({ error: 'Unauthorized' });
              }
            const notifications = await this.notificationService.listNotifications(userId);
            res.json(notifications);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }

    async markAsRead(req: Request, res: Response): Promise<void> {
        try {
            const { id } = req.params;
            const notification = await this.notificationService.markAsRead(id);
            if (!notification) {
                res.status(404).json({ error: 'Notification not found' });
                return;
            }
            res.json(notification);
        } catch (error: any) {
            res.status(500).json({ error: error.message });
        }
    }
}