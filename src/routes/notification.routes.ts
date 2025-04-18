import express, { Request, Response } from 'express';
import { authenticateToken } from '../middlewares/authMiddleware';
import { NotificationController } from '../controllers/NotificationController';
import { validate } from '../middlewares/validationMiddleware';
import { NotificationSchema as notificationSchema} from '../schemas/NotificationSchema';

const router = express.Router();
const notificationController = new NotificationController();

router.post('/', authenticateToken, validate(notificationSchema), async (req: Request, res: Response) => {
  await notificationController.createNotification(req, res);
});

router.get('/', authenticateToken, async (req: Request, res: Response) => {
  await notificationController.listNotifications(req, res);
});

router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  await notificationController.markAsRead(req, res);
});

export default router;