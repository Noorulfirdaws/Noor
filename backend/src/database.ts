import { Pool } from 'pg';
import { DB } from './config';

const pool = new Pool({
  host: DB.host,
  port: DB.port,
  database: DB.database,
  user: DB.user,
  password: DB.password,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL database');
});

pool.on('error', (err) => {
  console.error('Database error:', err);
});

export default pool;