import { Request, Response, NextFunction } from 'express';
import { ProjectMemberService } from '../services/ProjectMemberService';

export const rbacMiddleware = (allowedRoles: ('admin' | 'editor' | 'viewer')[]) => {
  return async (req: Request, res: Response, next: NextFunction): Promise<any> => {
    try {
      
      const projectId = req.params.id;
      const userId = (req as any).user?.userId;
      if (!projectId || !userId) {
        return res.status(400).json({ error: 'Missing project ID or user ID' });
      }
      const projectMemberService = new ProjectMemberService();
      const member = await projectMemberService.getMemberByProjectAndUser(projectId, userId);
      if (!member) {
        res.status(403).json({ error: 'User is not a member of this project' });
        return;
      }
      if (!allowedRoles.includes(member.role)) {
        res.status(403).json({ error: 'User does not have permission to perform this action' });
        return;
      }
      next();
    } catch (error) {
      console.error('RBAC middleware error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  };
};
