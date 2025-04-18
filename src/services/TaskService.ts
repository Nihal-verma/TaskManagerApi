import { Pool } from 'pg';
import { Task } from '../models/Task';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';
import { userService } from './UserService';
import { NotificationService } from './NotificationService';

export class TaskService {
 
  private addDays(date: Date, days: number): Date {
    const result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
  }

  private addWeeks(date: Date, weeks: number): Date {
    return this.addDays(date, weeks * 7);
  }

  private addMonths(date: Date, months: number): Date {
    const result = new Date(date);
    result.setMonth(result.getMonth() + months);
    return result;
  }

  generateRecurrences(task: Task, date: Date): Task[] {
    const recurrences: Task[] = [task];
    if (!task.recurrence || !task.recurrenceEndDate) return recurrences;

    let nextDueDate = new Date(date);
    while (nextDueDate <= task.recurrenceEndDate) {
      const recurrenceTask = { ...task, id: uuidv4(), dueDate: new Date(nextDueDate) };

      if (task.recurrence === 'daily') nextDueDate = this.addDays(nextDueDate, 1);
      else if (task.recurrence === 'weekly') nextDueDate = this.addWeeks(nextDueDate, 1);
      else if (task.recurrence === 'monthly') nextDueDate = this.addMonths(nextDueDate, 1);

      if (nextDueDate <= task.recurrenceEndDate) recurrences.push(recurrenceTask);
    }

    return recurrences;
  }

  async createTask(taskData: Partial<Task>, projectId: string): Promise<Task> {
    const id = uuidv4();
    const {
      title, description, status, dueDate, priority, estimatedTime,
      attachmentPath, recurrence, recurrenceEndDate, dependencies, assignedTo
    } = taskData;
  
    const notificationService = new NotificationService();
  
    if (assignedTo) {
      const user = await userService.findById(assignedTo);
      if (!user) throw new Error('Assigned user not found');
    }
  
   
    if (dependencies && dependencies.length > 0) {
      const depCheckQuery = `
        SELECT id FROM tasks
        WHERE id = ANY($1::uuid[]) AND projectid = $2
      `;
      const depCheckValues = [dependencies, projectId];
      const depCheckResult = await pool.query(depCheckQuery, depCheckValues);
  
      if (depCheckResult.rows.length !== dependencies.length) {
        throw new Error('Some dependencies are invalid or do not belong to the same project');
      }
    }
  
    const query = `
      INSERT INTO tasks (
        id, title, description, status, duedate, priority, estimatedtime,
        attachmentpath, recurrence, recurrenceenddate, dependencies, assignedto, projectid
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING *;
    `;
    const values = [
      id, title, description, status, dueDate, priority, estimatedTime,
      attachmentPath, recurrence, recurrenceEndDate, dependencies, assignedTo, projectId
    ];
    const result = await pool.query(query, values);
    const task = result.rows[0] as Task;
    if (assignedTo) {
      await notificationService.createNotification(assignedTo, `You have a new task: ${task.title}`, 'task_assigned', String(task.id));
    }
  
    return task;
  }
  
  async getTaskById(taskId: string): Promise<Task | null> {
    const query = `SELECT * FROM tasks WHERE id = $1;`;
    const result = await pool.query(query, [taskId]);
    return result.rows.length > 0 ? result.rows[0] as Task : null;
  }

  async updateTask(taskId: string, taskData: Partial<Task>): Promise<Task | null> {
    const {
      title, description, status, dueDate, priority, estimatedTime,
      attachmentPath, recurrence, recurrenceEndDate, dependencies, assignedTo, category
    } = taskData;

    const currentTask = await this.getTaskById(taskId);
    if (!currentTask) throw new Error("Task not found");

    const notificationService = new NotificationService();

    if (assignedTo) {
      const user = await userService.findById(assignedTo);
      if (!user) throw new Error('Assigned user not found');
    }

    if (status === 'in progress' && currentTask.dependencies?.length) {
      const dependenciesStatus = await Promise.all(
        currentTask.dependencies.map(async depId => {
          const dependency = await this.getTaskById(depId);
          if (!dependency) throw new Error(`Dependency ${depId} not found`);
          return dependency.status === 'done';
        })
      );
      if (dependenciesStatus.some(dep => !dep)) {
        throw new Error("Cannot start task. Not all dependencies are done");
      }
    }

    if (assignedTo && currentTask.assignedTo !== assignedTo) {
      await notificationService.createNotification(assignedTo, `You have a new task assigned: ${title}`, 'task_assigned', taskId);
    }

    const query = `
      UPDATE tasks
      SET title = COALESCE($2, title),
          description = COALESCE($3, description),
          status = COALESCE($4, status),
          duedate = COALESCE($5, duedate),
          priority = COALESCE($6, priority),
          estimatedtime = COALESCE($7, estimatedtime),
          attachmentpath = COALESCE($8, attachmentpath),
          recurrence = COALESCE($9, recurrence),
          recurrenceenddate = COALESCE($10, recurrenceenddate),
          dependencies = COALESCE($11, dependencies),
          assignedto = COALESCE($12, assignedto),
          category = COALESCE($13, category)

      WHERE id = $1
      RETURNING *;
    `;
    const values = [taskId, title, description, status, dueDate, priority, estimatedTime, attachmentPath, recurrence, recurrenceEndDate, dependencies, assignedTo, category];
    const result = await pool.query(query, values);
    return result.rows.length > 0 ? result.rows[0] as Task : null;
  }

  async updateTaskStatus(taskId: string, newStatus: string): Promise<Task> {
    // Fetch the task
    const taskResult = await pool.query('SELECT * FROM tasks WHERE id = $1', [taskId]);
    const task = taskResult.rows[0];
  
    // Check dependencies
    if (task.dependencies && newStatus === 'in progress') {
      const depIds = task.dependencies as string[];
  
      const depCheckQuery = `
        SELECT * FROM tasks
        WHERE id = ANY($1) AND status != 'completed'
      `;
      const depCheckResult = await pool.query(depCheckQuery, [depIds]);
  
      if (depCheckResult.rows.length > 0) {
        throw new Error('Cannot start this task until all dependencies are completed.');
      }
    }
  
    // Update task status
    const updateQuery = `
      UPDATE tasks SET status = $1 WHERE id = $2 RETURNING *
    `;
    const updatedResult = await pool.query(updateQuery, [newStatus, taskId]);
  
    return updatedResult.rows[0];
  }
  

  async deleteTask(taskId: string): Promise<boolean> {
    const result = await pool.query(`DELETE FROM tasks WHERE id = $1;`, [taskId]);
    return (result.rowCount ?? 0) > 0;
  }

  async listTasks(
    status?: string,
    dueDate?: string,
    category?: string,
    priority?: string,
    sortBy?: string,
    sortOrder: 'asc' | 'desc' = 'asc'
  ): Promise<Task[]> {
    let query = `SELECT * FROM tasks WHERE TRUE`;
    const values: any[] = [];

    if (status) {
      values.push(status);
      query += ` AND status = $${values.length}`;
    }
    if (dueDate) {
      values.push(dueDate);
      query += ` AND duedate = $${values.length}`;
    }
    if (category) {
      values.push(category);
      query += ` AND category = $${values.length}`;
    }
    if (priority) {
      values.push(priority);
      query += ` AND priority = $${values.length}`;
    }

    if (sortBy) {
      query += ` ORDER BY ${sortBy} ${sortOrder.toUpperCase()}`;
    }

    const result = await pool.query(query, values);
    let allTasks: Task[] = [];

    result.rows.forEach(task => {
      allTasks = allTasks.concat(this.generateRecurrences(task, task.dueDate));
    });

    return allTasks;
  }

  async countTasksByUser(userId: string): Promise<{ completed: number; pending: number }> {
    const completed = await pool.query(`SELECT COUNT(*) FROM tasks WHERE assignedto = $1 AND status = 'done';`, [userId]);
    const pending = await pool.query(`SELECT COUNT(*) FROM tasks WHERE assignedto = $1 AND status != 'done';`, [userId]);

    return {
      completed: completed.rows[0].count,
      pending: pending.rows[0].count
    };
  }

  async getTaskDistributionByCategory(): Promise<{ category: string; count: number }[]> {
    const result = await pool.query(`
      SELECT category, COUNT(*) as count FROM tasks GROUP BY category;
    `);
    return result.rows.map(row => ({
      category: row.category,
      count: parseInt(row.count, 10),
    }));
  }

  async getOverdueTasks(userId: string): Promise<Task[]> {
    const result = await pool.query(`
      SELECT * FROM tasks WHERE duedate < NOW() AND assignedto = $1;
    `, [userId]);

    return result.rows as Task[];
  }

  async getCompletedTasksPerTimeRange(userId: string, period: string, startDate: string, endDate: string): Promise<any[]> {
    if (!['day', 'week'].includes(period)) {
      throw new Error("Invalid period. Period must be 'day' or 'week'");
    }

    const values: any[] = [userId, startDate, endDate];
    let query: string;

    if (period === 'day') {
      query = `
        SELECT
        DATE(duedate) AS date,
        projectid,
        priority,
        assignedto,
        COUNT(*) AS count
        FROM tasks
        WHERE assignedto = $1
        AND status = 'done'
      AND duedate BETWEEN $2 AND $3
GROUP BY DATE(duedate), projectid, priority, assignedto
ORDER BY DATE(duedate)
      `;
    } else {
      query = `
        SELECT 
  DATE_TRUNC('week', duedate) AS start_week,
  (DATE_TRUNC('week', duedate) + INTERVAL '6 days') AS end_week,
  projectid,
  priority,
  assignedto,
  COUNT(*) AS count
FROM tasks
WHERE assignedto = $1 
  AND status = 'done' 
  AND duedate BETWEEN $2 AND $3
GROUP BY DATE_TRUNC('week', duedate), projectid, priority, assignedto
ORDER BY DATE_TRUNC('week', duedate);
      `;
    }

    const result = await pool.query(query, values);

    return period === "day"
      ? result.rows.map(row => ({ date: row.date, count: parseInt(row.count, 10) }))
      : result.rows.map(row => ({ startWeek: row.start_week, endWeek: row.end_week, count: parseInt(row.count, 10) }));
  }
}
