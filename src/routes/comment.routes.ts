import express, { Router } from 'express';
import { CommentController } from '../controllers/CommentController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { CommentSchema as commentSchema } from '../schemas/CommentSchema';
import { CommentService } from '../services/CommentService';
const router: Router = express.Router({ mergeParams: true });
const commentService = new CommentService()
const commentController = new CommentController(commentService);

router.post('/:taskId', authenticateToken, validate(commentSchema), (req, res) => commentController.createComment(req, res));
router.get('/', authenticateToken, (req, res) => commentController.listComments(req, res));

export default router;