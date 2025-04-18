import { Pool } from 'pg';
import { Category } from '../models/Category';
import pool from '../config/db';
import { v4 as uuidv4 } from 'uuid';

export class CategoryService {

  async createCategory(categoryData: Partial<Category>): Promise<Category> {
    const id = uuidv4();
    const { name, userId } = categoryData;
    const query = 'INSERT INTO categories (id, name, user_id) VALUES ($1, $2, $3) RETURNING *';
    const values = [id, name, userId];
    const result = await pool.query(query, values);
    return result.rows[0] as Category;
  }

  async getCategoryById(categoryId: string): Promise<Category | null> {
    const query = 'SELECT * FROM categories WHERE id = $1';
    const values = [categoryId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as Category;
  }

  async updateCategory(categoryId: string, categoryData: Partial<Category>): Promise<Category | null> {
    const { name } = categoryData;
    const query = 'UPDATE categories SET name = $1 WHERE id = $2 RETURNING *';
    const values = [name, categoryId];
    const result = await pool.query(query, values);
    if (result.rows.length === 0) {
      return null;
    }
    return result.rows[0] as Category;
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    const query = 'DELETE FROM categories WHERE id = $1';
    const values = [categoryId];
    const result = await pool.query(query, values);
    return (result.rowCount ?? 0) > 0;

  }

  async listCategories(userId: string): Promise<Category[]> {
    const query = 'SELECT * FROM categories WHERE user_id = $1';
    const values = [userId];
    const result = await pool.query(query, values);
    return result.rows as Category[];
  }
}
