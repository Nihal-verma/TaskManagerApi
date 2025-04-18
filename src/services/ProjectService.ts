

import { ProjectMemberService } from './ProjectMemberService';
import { Pool } from 'pg';
import pool from '../config/db';
import { Project } from '../models/Project';
import { v4 as uuidv4 } from 'uuid';
export class ProjectService {

  async createProject(projectData: Partial<Project>): Promise<Project> {
    const id = uuidv4();
    const { name, userId } = projectData;
  
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
  
      // Insert into projects
      const projectInsertQuery = 'INSERT INTO projects (id, name, userid) VALUES ($1, $2, $3) RETURNING *';
      const projectValues = [id, name, userId];
      const projectResult = await client.query(projectInsertQuery, projectValues);
      const project = projectResult.rows[0] as Project;
  
      // Insert into project_members
      const memberInsertQuery = `
        INSERT INTO project_members (id, projectid, userid, role)
        VALUES ($1, $2, $3, $4)
      `;
      const memberValues = [uuidv4(), id, userId, 'admin']; // Use 'owner' or 'admin' or just leave role if not used
      await client.query(memberInsertQuery, memberValues);
  
      await client.query('COMMIT');
      return project;
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
  
  async getProjectById(projectId: string, userId: string): Promise<Project | null> {
    const projectMemberService = new ProjectMemberService();
    const member = await projectMemberService.getMemberByProjectAndUser(projectId, userId); // Use the new method
    if (!member) {
      throw new Error('Unauthorized. User is not a member of this project.');
    }

    const query = 'SELECT * FROM projects WHERE id = $1;';
    const values = [projectId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Project;
  }

  // Method to update a project and validate the user's role
  async updateProject(projectId: string, userId: string, projectData: Partial<Project>): Promise<Project | null> {
    const projectMemberService = new ProjectMemberService();
    const member = await projectMemberService.getMemberByProjectAndUser(projectId, userId); // Use the new method
    if (!member) {
      throw new Error('Unauthorized. User is not a member of this project.');
    }

    if (member.role !== 'admin' && member.role !== 'editor') {
      throw new Error('Unauthorized. User does not have the required role to update the project.');
    }

    const { name } = projectData;
    const query = 'UPDATE projects SET name = $1 WHERE id = $2 RETURNING *;';
    const values = [name, projectId];
    const result = await pool.query(query, values);

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as Project;
  }
  async listProjects(userId: string): Promise<Project[]> {
    const query = 'SELECT * FROM projects WHERE userid = $1';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows as Project[];
  }

  // Method to delete a project and validate the user's role
  async deleteProject(projectId: string, userId: string): Promise<boolean> {
    const projectMemberService = new ProjectMemberService();
    const member = await projectMemberService.getMemberByProjectAndUser(projectId, userId);
  
    if (!member) {
      throw new Error('Unauthorized. User is not a member of this project.');
    }
  
    if (member.role !== 'admin') {
      throw new Error('Unauthorized. User does not have the required role to delete the project.');
    }
  
    const client = await pool.connect();
  
    try {
      await client.query('BEGIN');
      await client.query('DELETE FROM project_members WHERE projectid = $1', [projectId]);
      const result = await client.query('DELETE FROM projects WHERE id = $1', [projectId]);
      await client.query('COMMIT');
      return (result.rowCount ?? 0) > 0;
    } catch (err) {
      await client.query('ROLLBACK');
      console.error('Error deleting project:', err);
      throw err;
    } finally {
      client.release();
    }
  }
  
}
