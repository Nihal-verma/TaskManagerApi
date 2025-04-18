import express from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { ProjectMemberController } from '../controllers/ProjectMemberController';
import { rbacMiddleware } from '../middlewares/rbacMiddleware';
import { validate } from '../middlewares/validationMiddleware';
import { ProjectMemberCreateSchema, ProjectMemberUpdateSchema } from '../schemas/ProjectMemberSchema';


const router = express.Router();
const projectMemberController = new ProjectMemberController();

router.post('/:projectId/addMembers', authenticateToken, rbacMiddleware(['admin']), validate(ProjectMemberCreateSchema), (req, res) => projectMemberController.addMember(req, res));
router.put('/:projectId/updateMember/:id', authenticateToken, rbacMiddleware(['admin']), validate(ProjectMemberUpdateSchema), (req, res) => projectMemberController.updateMember(req, res));
router.delete('/:projectId/deleteMember/:id', authenticateToken, rbacMiddleware(['admin']), (req, res) => projectMemberController.deleteMember(req, res));
router.get('/:projectId/getMembers', authenticateToken, rbacMiddleware(['admin', 'editor', 'viewer']), (req, res) => projectMemberController.listMembers(req, res));

export default router;