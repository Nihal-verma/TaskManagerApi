import { Pool } from 'pg';
import { ActivityLog } from '../models/ActivityLog';
import pool  from '../config/db'; 
import { v4 as uuidv4 } from 'uuid';

export class ActivityLogService {
  
  async recordActivity(logData: Partial<ActivityLog>): Promise<ActivityLog> {
   
    try {
      const id = uuidv4();
      const { userId, activityType, details } = logData;
      const timestamp = new Date();

      const query = `
        INSERT INTO activity_logs (id, userid, activitytype, timestamp, details)
        VALUES ($1, $2, $3, $4, $5)
        RETURNING *
      `;
      const values = [id, userId, activityType, timestamp, details];
      const result = await pool.query(query, values);
      return result.rows[0] as ActivityLog;
    } catch (error) {
      throw error;
    }
  
  }
}
