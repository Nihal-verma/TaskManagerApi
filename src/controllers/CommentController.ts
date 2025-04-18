import { Request, Response } from 'express';
import { CommentService } from '../services/CommentService';
import { AuthenticatedRequest } from "../types/AuthenticatedRequest";
import { v4 as uuidv4} from 'uuid';
export class CommentController {
  private commentService: CommentService;

  constructor(commentService: CommentService) {
    this.commentService = commentService;
  }

  async createComment(req: AuthenticatedRequest, res: Response): Promise<any> {
    try {
      
      const {taskId} = req.params
      const userId = req.user?.userId;
     const  id=  uuidv4()
      const { content } = req.body;
      if (!userId) {
        return res.status(401).json({ error: 'Unauthorized' });
      }
      const comment = await this.commentService.createComment(id,taskId, userId, content);
      res.status(201).json(comment);
    } catch (error: any) {
      console.log("error",error);
      
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }

  async listComments(req: Request, res: Response): Promise<void> {
    try {
      const { taskId } = req.params;
      const comments = await this.commentService.listComments(taskId);
      res.json(comments);
    } catch (error: any) {
      res.status(error.statusCode || 500).json({ error: error.message });
    }
  }
}