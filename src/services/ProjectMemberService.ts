import { Pool } from 'pg';
import { ProjectMember } from '../models/ProjectMember';
import  pool from '../config/db';
import { v4 as uuidv4} from 'uuid';
export class ProjectMemberService {

  async getMemberByProjectAndUser(projectId: string, userId: string): Promise<ProjectMember | null> {
    const query = `
      SELECT * FROM project_members 
      WHERE projectid = $1 AND userid = $2
    `;
    const values = [projectId, userId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as ProjectMember;
  }

  async addMember(projectId: string, userId: string, role: string): Promise<ProjectMember> {
    if (!['admin', 'editor', 'viewer'].includes(role)) {
      throw new Error('Invalid role');
    }
    const id = uuidv4()
    const query = `
      INSERT INTO project_members (id,projectid, userid, role) 
      VALUES ($1, $2, $3,$4) RETURNING *;
    `;
    const values = [id,projectId, userId, role];
    const result = await pool.query(query, values);

    return result.rows[0];
  }

  async updateMember(projectId:string,memberId: string, role: string): Promise<ProjectMember | null> {
    const allowedRoles = ['admin', 'editor', 'viewer'];

    if (!allowedRoles.includes(role)) {
      throw new Error('Invalid role');
    }

    const query = `
      UPDATE project_members SET role = $1 WHERE userid = $2 AND projectId = $3 RETURNING *;
    `;
    const values = [role, memberId,projectId];
    const result = await pool.query(query, values);
    return result.rows[0] || null;
  }

  async deleteMember(memberId: string): Promise<boolean> {
    const query = 'DELETE FROM project_members WHERE userid = $1 RETURNING *;';
    const values = [memberId];
    const result = await pool.query(query, values);
    return (result.rowCount ?? 0) > 0;
  }
  async listMembers(projectId: string): Promise<ProjectMember[]> {
    const query = 'SELECT * FROM project_members WHERE projectid = $1;';
    const values = [projectId];
    const result = await pool.query(query, values);
    return result.rows;
  }
}

