

import { Pool } from 'pg';
import pool from '../config/db';
import { User } from '../models/User';
import bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';
import { ActivityLogService } from './ActivityLogService';
import { ActivityLog } from '../models/ActivityLog';

class UserService {

  async createUser(user:User): Promise<User> {
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const id = uuidv4();
    
    const query = `
      INSERT INTO users (id, username,name, email, password, "refreshToken")
      VALUES ($1, $2, $3, $4, $5,$6)
      RETURNING *
    `;
    
    const values = [user.id, user.username,user.name, user.email, hashedPassword, null];
    const { rows } = await pool.query(query, values);
    return rows[0] as User;
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE email = $1`;
    const values = [email];
    const { rows } = await pool.query(query, values);
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async updateRefreshToken(userId: string, refreshToken: string): Promise<void> {
    const query = `UPDATE users SET "refreshToken" = $1 WHERE id = $2`;
    const values = [refreshToken, userId];
    await pool.query(query, values);
  }

  async updateUser(userId: string, updateData: Partial<User>): Promise<User> {
    const { password, ...otherData } = updateData;
    const setStatements = Object.keys(otherData)
      .map((key, index) => `"${key}" = $${index + 2}`)
      .join(', ');

    const values = [userId, ...Object.values(otherData)];

    let query = `UPDATE users SET ${setStatements} WHERE id = $1 RETURNING *`;

    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      query = `UPDATE users SET ${setStatements}, password=$${values.length + 1} WHERE id = $1 RETURNING *`;
      values.push(hashedPassword);
    }

    const { rows } = await pool.query(query, values);
    return rows[0] as User;
  }

  async generateResetToken(email: string): Promise<string> {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpires = new Date(Date.now() + 3600000); 

    const query = `
      UPDATE users 
      SET "resetToken" = $1, "resetTokenExpires" = $2
      WHERE email = $3
      RETURNING *
    `;
    const values = [resetToken, resetTokenExpires, email];
    await pool.query(query, values);

    return resetToken;
  }

  async resetPassword(token: string, newPassword: string): Promise<User> {
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const query = `
      UPDATE users 
      SET password = $1, "resetToken" = NULL, "resetTokenExpires" = NULL
      WHERE "resetToken" = $2 AND "resetTokenExpires" > NOW()
      RETURNING *
    `;
    const values = [hashedPassword, token];
    const { rows } = await pool.query(query, values);

    if (rows.length === 0) {
      throw new Error('Invalid or expired token');
    }

    return rows[0] as User;
  }

  async findById(userId: string): Promise<User | null> {
    const query = `SELECT * FROM users WHERE id = $1`;
    const values = [userId];
    const { rows } = await pool.query(query, values);
    return rows.length > 0 ? (rows[0] as User) : null;
  }

  async logActivity(logData: Partial<ActivityLog>): Promise<ActivityLog> {
    return await new ActivityLogService().recordActivity(logData);
  }
}

export const userService = new UserService();
