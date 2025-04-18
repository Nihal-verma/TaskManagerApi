import express from 'express';
import userRoute from './user.routes';
import taskRoute from './task.routes';
import projectRoute from './project.routes';
import categoryRoute from './category.routes';
import commentRoute from './comment.routes';
import projectMemberRoute from './projectMember.routes';
import notificationRoute from './notification.routes';
import { errorHandler } from '../middlewares/errorHandler';

const router = express.Router();

router.get('/', (req, res) => {
  res.send('Hello from the router!');
});


router.use('/users', userRoute);
router.use('/tasks', taskRoute);
router.use('/projects', projectRoute);
router.use('/categories', categoryRoute);
router.use('/projectMembers', projectMemberRoute);
router.use('/tasks/comments', commentRoute);
router.use('/notifications', notificationRoute);

router.use(errorHandler)

export default router;