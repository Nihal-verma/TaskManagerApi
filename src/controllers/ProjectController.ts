import { Request, Response } from 'express';
import { ProjectService } from '../services/ProjectService';
import { ProjectTaskService } from '../services/ProjectTaskService';
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
export class ProjectController {
  private projectService: ProjectService;
  private projectTaskService: ProjectTaskService;

  constructor(projectService: ProjectService, projectTaskService: ProjectTaskService) {
    this.projectService = projectService;
    this.projectTaskService = projectTaskService;
  }

  async createProject(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const { name } = req.body;
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const project = await this.projectService.createProject({ name, userId });
      res.status(201).json(project);
    } catch (error) {
      console.log("error",error);
      
      res.status(500).json({ error: 'Failed to create project' });
    }
  }

  async getProject(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const projectId = req.params.id;
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const project = await this.projectService.getProjectById(projectId, userId);
      if (!project) return res.status(404).json({ error: 'Project not found' });
      if (typeof project === 'boolean') return res.status(403).json({ error: 'Forbidden' });

      res.json(project);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get project' });
    }
  }

  async updateProject(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const projectId = req.params.id;
      const userId = req.user?.userId;
      const projectData = req.body;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });

      const updatedProject = await this.projectService.updateProject(projectId, userId, projectData);
      if (!updatedProject) return res.status(404).json({ error: 'Project not found' });
      if (typeof updatedProject === 'boolean') return res.status(403).json({ error: 'Forbidden' });

      res.json(updatedProject);
    } catch (error) {
      console.log("error",error);
      
      res.status(500).json({ error: 'Failed to update project' });
    }
  }

  async deleteProject(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const projectId = req.params.id;
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const deleted = await this.projectService.deleteProject(projectId, userId);
      if (!deleted) return res.status(404).json({ error: 'Project not found' });
      res.json({ message: 'Project deleted' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete project' });
    }
  }

  async listProjects(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      const userId = req.user?.userId;
      if (!userId) return res.status(401).json({ error: 'Unauthorized' });
      const projects = await this.projectService.listProjects(userId);
      res.json(projects);
    } catch (error) {
      res.status(500).json({ error: 'Failed to list projects' });
    }
  }

  async getProjectProgress(req: Request, res: Response): Promise<void> {
    try {
      const projectId = req.params.id;
      const progress = await this.projectTaskService.getProjectProgress(projectId);
      res.json(progress);
    } catch (error) {
      console.log(error);
      
      res.status(500).json({ error: 'Failed to get project progress' });
    }
  }
}
