import { Pool } from 'pg';
import pool from '../config/db';

export class ProjectTaskService {
  async getProjectProgress(projectId: string): Promise<any> {
    const totalTasksQuery = `
      SELECT COUNT(*) FROM tasks WHERE projectid = $1;
    `;
    const completedTasksQuery = `
      SELECT COUNT(*) FROM tasks WHERE projectid = $1 AND status = 'done';
    `;

    const totalTasksResult = await pool.query(totalTasksQuery, [projectId]);
    const completedTasksResult = await pool.query(completedTasksQuery, [projectId]);
    const totalTasks = parseInt(totalTasksResult.rows[0].count);
    const completedTasks = parseInt(completedTasksResult.rows[0].count);

    if (totalTasks === 0) {
      return 0;
    }

    return [{"totaltasks":totalTasks,"completedTasks":completedTasks}]
  }
}