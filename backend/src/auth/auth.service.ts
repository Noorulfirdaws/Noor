import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../database';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'djib-taxi-super-secret-key-2024';

export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  role: 'customer' | 'driver' | 'admin';
}

export const registerUser = async (
  name: string,
  email: string,
  password: string,
  role: 'customer' | 'driver' = 'customer'
) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    'INSERT INTO users (name, email, password, role) VALUES ($1, $2, $3, $4) RETURNING id, name, email, role',
    [name, email, hashedPassword, role]
  );

  const user = result.rows[0];
  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return { user, token };
};

export const loginUser = async (email: string, password: string) => {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  if (result.rows.length === 0) throw new Error('Invalid email or password');

  const user = result.rows[0];
  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new Error('Invalid email or password');

  const token = jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );

  return {
    user: { id: user.id, name: user.name, email: user.email, role: user.role },
    token
  };
};

export const getUserById = async (id: string) => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query('SELECT id, name, email, role, created_at FROM users');
  return result.rows;
};