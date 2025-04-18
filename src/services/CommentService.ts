import { userService } from './UserService'; 
import { TaskService } from './TaskService';
import { NotificationService } from './NotificationService';
import { Comment } from '../models/Comment';
import pool from '../config/db';
import { v4 as uuidv4} from 'uuid';
export class CommentService {
  private taskService: TaskService;
  private notificationService: NotificationService;

  constructor() {
    this.notificationService = new NotificationService();
    this.taskService = new TaskService();
  }

  async createComment(id:string,taskId: string, userId: string, content: string): Promise<Comment> {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const user = await userService.findById(userId);
    if (!user) throw new Error('User not found');

    const timestamp = new Date();

    const query = `
      INSERT INTO comments (id,taskid, userid, content, timestamp)
      VALUES ($1, $2, $3, $4,$5)
      RETURNING *;
    `;
    const values = [id,taskId, userId, content, timestamp];

    const result = await pool.query(query, values);

    if (task.assignedTo && task.assignedTo !== userId) {
      await this.notificationService.createNotification(
        task.assignedTo,
        `New comment on task: ${task.title}`,
        'new_comment',
        taskId
      );
    }

    return result.rows[0];
  }

  async listComments(taskId: string): Promise<Comment[]> {
    const task = await this.taskService.getTaskById(taskId);
    if (!task) throw new Error('Task not found');

    const query = `
      SELECT * FROM comments
      WHERE taskid = $1
      ORDER BY timestamp ASC;
    `;
    const result = await pool.query(query, [taskId]);

    return result.rows as Comment[];
  }
}
