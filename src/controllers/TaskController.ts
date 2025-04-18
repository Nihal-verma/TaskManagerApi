import { Request, Response } from 'express';
import { TaskService } from '../services/TaskService';
import { ActivityLogMiddleware } from '../middlewares/activityLogMiddleware';
import { AuthenticatedRequest } from '../types/AuthenticatedRequest';

export class TaskController {
  private taskService: TaskService;
  private activityLogMiddleware: ActivityLogMiddleware;
  constructor(taskService: TaskService, activityLogMiddleware: ActivityLogMiddleware) {
    this.taskService = taskService;
    this.activityLogMiddleware = activityLogMiddleware;
  }

  public async createTask(req: Request, res: Response): Promise<any> {
    try {
      const taskData = req.body;
      const projectId = req.params.projectId
      if (req.file) {
        taskData.attachmentPath = req.file.path;
      }
      taskData.recurrence = taskData.recurrence || null;
      taskData.recurrenceEndDate = taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : null;
      const task = await this.taskService.createTask(taskData,projectId);
      res.status(201).json(task);
    } catch (error) {
      console.log("error",error);
      
      if (error instanceof Error && error.message === 'Invalid user') {
        return res.status(400).json({ error: 'Invalid user' });
      }
      res.status(500).json({ error: 'Could not create task' });
    }
  }

  public async getTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id;
      const task = await this.taskService.getTaskById(taskId);
      if (task) {
        res.status(200).json(task);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Could not get task' });
    }
  }

  public async updateTask(req: Request, res: Response): Promise<any> {
    try {
      const taskId = (req as any).params.id;
      const taskData = (req as any).body;
  
      if (req.file) {
        taskData.attachmentPath = req.file.path;
      }
  
      taskData.recurrence = taskData.recurrence || null;
      taskData.recurrenceEndDate = taskData.recurrenceEndDate ? new Date(taskData.recurrenceEndDate) : null;
      const updatedTask = await this.taskService.updateTask(taskId, taskData);
  
      if (updatedTask) {
        const userId = (req as any).user.id;
        const logData = {
          title: taskData.title,
          description: taskData.description,
          status: taskData.status,
          recurrence: taskData.recurrence,
          recurrenceEndDate: taskData.recurrenceEndDate,
          attachmentPath: taskData.attachmentPath,
        };
  
        await this.activityLogMiddleware.logTaskUpdateManually(userId, taskId, taskData);
        res.status(200).json(updatedTask);
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (error) {
      if (error instanceof Error) {
        if (error.message === 'Dependencies not met') {
          return res.status(400).json({ error: 'Task dependencies not completed' });
        }
        if (error.message === 'Invalid user') {
          return res.status(400).json({ error: 'Invalid user' });
        }
      }
      res.status(500).json({ error: 'Could not update task' });
    }
  }
  

  

  public async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = req.params.id;
      const deleted = await this.taskService.deleteTask(taskId);
      if (deleted) {
        res.status(204).send();
      } else {
        res.status(404).json({ error: 'Task not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Could not delete task' });
    }
  }

  public async listTasks(req: Request, res: Response): Promise<void> {
    try {
      const { status, dueDate, category, priority, sortBy, sortOrder } = req.query;
  
      const queryParams = {
        status: status ? (status as string) : undefined,
        dueDate: dueDate ? (dueDate as string) : undefined,  
        category: category ? (category as string) : undefined,
        priority: priority ? (priority as string) : undefined,
        sortBy: sortBy ? (sortBy as string) : undefined,
        sortOrder: (sortOrder && (sortOrder === 'asc' || sortOrder === 'desc')) ? (sortOrder as 'asc' | 'desc') : 'asc', 
      };
  
      const tasks = await this.taskService.listTasks(
        queryParams.status,
        queryParams.dueDate,
        queryParams.category,
        queryParams.priority,
        queryParams.sortBy,
        queryParams.sortOrder
      );
  
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Could not list tasks' });
    }
  }
  
  

  public async countTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const counts = await this.taskService.countTasksByUser(userId);
      res.status(200).json(counts);
    } catch (error) {
      res.status(500).json({ error: 'Could not count tasks' });
    }
  }

  public async getTaskDistributionByCategory(req: Request, res: Response): Promise<void> {
    try {
      const distribution = await this.taskService.getTaskDistributionByCategory();
      res.status(200).json(distribution);
    } catch (error) {
      res.status(500).json({ error: 'Could not get task distribution by category' });
    }
  }
 

  public async getOverdueTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = (req as any).user.userId;
      const tasks = await this.taskService.getOverdueTasks(userId);
      res.status(200).json(tasks);
    } catch (error) {
      res.status(500).json({ error: 'Could not get overdue tasks' });
    }
  }

  public async getCompletedTasksPerTimeRange(req: Request, res: Response): Promise<any> {
    try {
      const userId = (req as any).user.userId;
      const { period, startDate, endDate } = req.query;
      const data = await this.taskService.getCompletedTasksPerTimeRange(
        userId,
        period as string,
        startDate as string,
        endDate as string
      );
      res.status(200).json(data);
    } catch (error) {
      if (error instanceof Error && error.message === 'Invalid period') {
        return res.status(400).json({ error: 'Invalid period. Period can only be \'day\' or \'week\'' });
      }
      res.status(500).json({ error: 'Could not get completed tasks per period' });
    }
  }
}

