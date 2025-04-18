import express from 'express';
import multer from 'multer';

import { UserController } from '../controllers/UserController';
import { authenticateToken } from '../middlewares/authMiddleware';
import { ActivityLogMiddleware } from '../middlewares/activityLogMiddleware';
import { ActivityLogService } from '../services/ActivityLogService';
import { validate } from '../middlewares/validationMiddleware';
import { CreateUserSchema as createUserSchema, UpdateUserSchema as updateUserSchema } from '../schemas/UserSchema';


const upload = multer({ dest: 'uploads/' }); 
const router = express.Router();
const userController = new UserController();
const activityLogService = new ActivityLogService();
const activityLogger = new ActivityLogMiddleware(activityLogService);

router.post('/register', validate(createUserSchema), (req, res) =>
  userController.register(req, res)
);

router.post('/login', async (req, res, next) => {
  const userId = await userController.login(req, res);

  if (userId) {
    await activityLogger.logActivity(userId, 'login');
  }
});

router.put('/update',authenticateToken,upload.single('avatar'),validate(updateUserSchema),
  (req, res) => userController.updateProfile(req, res)
);

router.post('/forgot-password', (req, res) => userController.forgotPassword(req, res));
router.post('/reset-password', (req, res) => userController.resetPassword(req, res));

export default router;
