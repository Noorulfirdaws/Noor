import pool from '../database';

export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export const createComplaint = async (
  tripId: string,
  userId: string,
  against: string,
  reason: string,
  description: string
) => {
  const result = await pool.query(
    `INSERT INTO complaints (trip_id, user_id, against, reason, description, status)
     VALUES ($1, $2, $3, $4, $5, 'open') RETURNING *`,
    [tripId, userId, against, reason, description]
  );
  return result.rows[0];
};

export const getAllComplaints = async () => {
  const result = await pool.query('SELECT * FROM complaints ORDER BY created_at DESC');
  return result.rows;
};

export const getComplaintById = async (id: string) => {
  const result = await pool.query('SELECT * FROM complaints WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new Error('Complaint not found');
  return result.rows[0];
};

export const getUserComplaints = async (userId: string) => {
  const result = await pool.query(
    'SELECT * FROM complaints WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  );
  return result.rows;
};

export const updateComplaintStatus = async (id: string, status: ComplaintStatus) => {
  const result = await pool.query(
    'UPDATE complaints SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    [status, id]
  );
  if (result.rows.length === 0) throw new Error('Complaint not found');
  return result.rows[0];
};