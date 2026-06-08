import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import pool from '../database';

dotenv.config();

const JWT_SECRET = process.env.JWT_SECRET || 'djib-taxi-super-secret-key-2024';

export interface User {
  id: string;
  name: string;
  father_name: string | null;
  grandfather_name: string | null;
  email: string;
  password: string;
  role: 'customer' | 'driver' | 'admin';
}

export const registerUser = async (
  name: string,
  fatherName: string,
  grandfatherName: string,
  email: string,
  password: string,
  role: 'customer' | 'driver' = 'customer'
) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows.length > 0) throw new Error('Email already registered');

  const hashedPassword = await bcrypt.hash(password, 10);

  const result = await pool.query(
    `INSERT INTO users (name, father_name, grandfather_name, email, password, role)
     VALUES ($1, $2, $3, $4, $5, $6)
     RETURNING id, name, father_name, grandfather_name, email, role`,
    [name, fatherName, grandfatherName, email, hashedPassword, role]
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
    user: {
      id: user.id,
      name: user.name,
      father_name: user.father_name,
      grandfather_name: user.grandfather_name,
      email: user.email,
      role: user.role,
    },
    token,
  };
};

export const getUserById = async (id: string) => {
  const result = await pool.query(
    'SELECT id, name, father_name, grandfather_name, email, role FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

export const updateUserProfile = async (
  id: string,
  data: { name?: string; fatherName?: string; grandfatherName?: string }
) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (data.name)             { fields.push(`name = $${idx++}`);             values.push(data.name); }
  if (data.fatherName)       { fields.push(`father_name = $${idx++}`);      values.push(data.fatherName); }
  if (data.grandfatherName)  { fields.push(`grandfather_name = $${idx++}`); values.push(data.grandfatherName); }
  if (fields.length === 0) throw new Error('No fields to update');
  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx}
     RETURNING id, name, father_name, grandfather_name, email, role`,
    values
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

export const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, father_name, grandfather_name, email, role, created_at FROM users'
  );
  return result.rows;
};
