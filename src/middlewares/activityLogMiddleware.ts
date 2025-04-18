import { Request, Response, NextFunction } from 'express';
import { ActivityLogService } from '../services/ActivityLogService';

export class ActivityLogMiddleware {
  private activityLogService: ActivityLogService;

  constructor(activityLogService: ActivityLogService) {
    this.activityLogService = activityLogService;
  }

  async logActivity(userId: string, activityType: string, details?: string): Promise<void> {
    try {
      await this.activityLogService.recordActivity({
        userId,
        activityType,
        timestamp: new Date(),
        details,
      });
    } catch (error) {
      console.error('Error recording activity:', error);
    }
  }

  logLogin = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.userId;
    if (userId) {
      await this.logActivity(userId, 'login');
    }
    next();
  };

  logTaskUpdate = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const userId = (req as any).user?.userId;
    const taskId = req.params?.taskId;
    if (userId && taskId) {
      await this.logActivity(userId, 'task_updated', `Task ID: ${taskId}`);
    }
    next();
  };

  async logTaskUpdateManually(userId: string, taskId: string, taskData: Record<string, any>): Promise<void> {
    const logDetails = `Task ID: ${taskId}, Changes: ${JSON.stringify(taskData)}`;
    await this.logActivity(userId, 'task_updated', logDetails);
  }
}
