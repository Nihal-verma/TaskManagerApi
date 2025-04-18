import express from 'express';
import { TaskController } from '../controllers/TaskController';
import { TaskService } from '../services/TaskService';
import { ActivityLogService } from '../services/ActivityLogService';
import { ActivityLogMiddleware } from '../middlewares/activityLogMiddleware';
import { authenticateToken } from '../middlewares/authMiddleware';
import { upload } from '../middlewares/multerMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { createTaskSchema, updateTaskSchema } from '../schemas/TaskSchema';

const taskRoute = express.Router();

const activityLogService = new ActivityLogService();
const taskService = new TaskService();
const activityLogMiddleware = new ActivityLogMiddleware(activityLogService);

const taskController = new TaskController(taskService, activityLogMiddleware);

taskRoute.post('/:projectId', authenticateToken, upload.single('attachment'), validate(createTaskSchema), (req, res) => taskController.createTask(req, res));
taskRoute.get('/', authenticateToken, (req, res) => taskController.listTasks(req, res));
taskRoute.put('/:id', authenticateToken, upload.single('attachment'), validate(updateTaskSchema), (req, res) => taskController.updateTask(req, res));
taskRoute.get('/count',authenticateToken,(req, res) => taskController.countTasks(req, res));
taskRoute.get('/getTask/:id', authenticateToken, (req, res) => taskController.getTask(req, res));
taskRoute.delete('/:id', authenticateToken, (req, res) => taskController.deleteTask(req, res));
taskRoute.get('/distribution-by-category', authenticateToken, (req, res) => taskController.getTaskDistributionByCategory(req, res));
taskRoute.get('/overdue', authenticateToken, (req, res) => taskController.getOverdueTasks(req, res));
taskRoute.get('/completed-by-period', authenticateToken, (req, res) => taskController.getCompletedTasksPerTimeRange(req, res));

export default taskRoute;
