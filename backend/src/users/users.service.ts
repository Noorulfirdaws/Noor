import pool from '../database';
import { User } from '../auth/auth.service';

export { User };

export const getAllUsers = async () => {
  const result = await pool.query(
    'SELECT id, name, email, role, created_at FROM users ORDER BY created_at DESC'
  );
  return result.rows;
};

export const getUserById = async (id: string) => {
  const result = await pool.query(
    'SELECT id, name, email, role FROM users WHERE id = $1',
    [id]
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

export const updateUser = async (id: string, data: { name?: string; email?: string }) => {
  const fields: string[] = [];
  const values: any[] = [];
  let idx = 1;
  if (data.name) { fields.push(`name = $${idx++}`); values.push(data.name); }
  if (data.email) { fields.push(`email = $${idx++}`); values.push(data.email); }
  if (fields.length === 0) throw new Error('No fields to update');
  values.push(id);
  const result = await pool.query(
    `UPDATE users SET ${fields.join(', ')} WHERE id = $${idx} RETURNING id, name, email, role`,
    values
  );
  if (result.rows.length === 0) throw new Error('User not found');
  return result.rows[0];
};

export const deleteUser = async (id: string) => {
  const result = await pool.query('DELETE FROM users WHERE id = $1 RETURNING id', [id]);
  if (result.rows.length === 0) throw new Error('User not found');
  return { message: 'User deleted successfully' };
};
