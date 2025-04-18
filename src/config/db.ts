import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();
const pool = new Pool({
  host: "localhost",
    port: 5432,
    user: "postgres",
    password: String(12345),
    database: "taskmanager",
})

async function testConnection() {
   
    try {
        let client = await pool.connect();
      console.log("Connected to PostgreSQL");
      client.release(); 
    } catch (error) {
      console.error("Database connection error:", error);
    } 
  }
  
  testConnection();
export default pool