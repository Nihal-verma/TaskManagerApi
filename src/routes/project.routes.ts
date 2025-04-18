import express from 'express';
import { ProjectController } from '../controllers/ProjectController';
import { ProjectTaskService } from '../services/ProjectTaskService';
import { ProjectService } from '../services/ProjectService';

import { authenticateToken } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { CreateProjectSchema, UpdateProjectSchema } from '../schemas/ProjectSchema';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
const projectRoute = express.Router();
const projectService = new ProjectService
const projectTaskService = new ProjectTaskService
const projectController = new ProjectController(projectService,projectTaskService);

projectRoute.post('/', authenticateToken, validate(CreateProjectSchema), (req, res) => projectController.createProject(req, res));
projectRoute.get('/', authenticateToken, (req, res) => projectController.listProjects(req, res));
projectRoute.get('/getById/:id', authenticateToken, rbacMiddleware(['admin', 'editor', 'viewer']), (req, res) => projectController.getProject(req, res)); 
projectRoute.put('/:id', authenticateToken, rbacMiddleware(['admin', 'editor']), validate(UpdateProjectSchema), (req, res) => projectController.updateProject(req, res)); 
projectRoute.delete('/:id', authenticateToken, rbacMiddleware(['admin']), (req, res) => projectController.deleteProject(req, res)); 
projectRoute.get('/:id/progress', authenticateToken, (req, res) => projectController.getProjectProgress(req, res));

export default projectRoute;