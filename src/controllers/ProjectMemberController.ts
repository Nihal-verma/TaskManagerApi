import { Request, Response } from 'express';
import { ProjectMemberService } from '../services/ProjectMemberService';

export class ProjectMemberController {
  private projectMemberService: ProjectMemberService;

  constructor() {
    this.projectMemberService = new ProjectMemberService();
  }

  public addMember = async (req: Request, res: Response): Promise<any> => {
    const { userId, role } = req.body;
    const { projectId } = req.params
    
    try {
      const projectMember = await this.projectMemberService.addMember(projectId, userId, role);
      res.status(201).json(projectMember);
    } catch (error:any) {
      if (error instanceof Error && error.message === 'Invalid role'){
        return res.status(400).json({ error: 'Invalid role' });
      }
      console.log("error",error);
      
      res.status(400).json({ message: error.message });
    }
  };

  public updateMember = async (req: Request, res: Response): Promise<any> => {
    const memberId  = req.params.id;
    const projectId = req.params.projectId
    const { role } = req.body;
    try {
      const updatedMember = await this.projectMemberService.updateMember(projectId,memberId, role);
      if (updatedMember) {
        res.json(updatedMember);
      } else {
        if (role === 'Invalid role') {
          return res.status(400).json({ error: 'Invalid role' });
        }
        res.status(404).json({ message: 'Member not found' });
      }
    } catch (error: any) {
      if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Something went wrong' });
      }
    }
  };
  

  public deleteMember = async (req: Request, res: Response): Promise<void> => {
    const memberId  = req.params.id;
    
    try {
      const success = await this.projectMemberService.deleteMember(memberId);
      if (success) {
        res.status(204).json({message:'Member deleted successfully'});
      } else {
        res.status(404).json({ message: 'Member not found' });
      }
    } catch (error:any) {
      res.status(400).json({ message: error.message });
    }
  };

  public listMembers = async (req: Request, res: Response): Promise<void> => {
    const { projectId } = req.params;
    try {
      const members = await this.projectMemberService.listMembers(projectId);
      res.json(members);
    } catch (error:any) {
      res.status(400).json({ message: error.message });
    }
  };
}