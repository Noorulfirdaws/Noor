import pool from './database';

export const initDatabase = async () => {
  try {
    await pool.query('SELECT 1');
    console.log('Database connection verified');
  } catch (error) {
    console.error('Database connection failed:', error);
    process.exit(1);
  }
};