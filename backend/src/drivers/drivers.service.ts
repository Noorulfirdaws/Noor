import pool from '../database';

export interface Driver {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  status: 'pending' | 'approved' | 'rejected' | 'suspended';
  isOnline: boolean;
  createdAt: Date;
}

export const registerDriver = async (data: {
  userId: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
}) => {
  const existing = await pool.query('SELECT id FROM drivers WHERE email = $1', [data.email]);
  if (existing.rows.length > 0) throw new Error('Driver already registered');

  const result = await pool.query(
    `INSERT INTO drivers (user_id, name, email, phone, license_number, vehicle_model, vehicle_plate, status, is_online)
     VALUES ($1, $2, $3, $4, $5, $6, $7, 'pending', false)
     RETURNING *`,
    [data.userId, data.name, data.email, data.phone, data.licenseNumber, data.vehicleModel, data.vehiclePlate]
  );
  return result.rows[0];
};

export const getAllDrivers = async () => {
  const result = await pool.query('SELECT * FROM drivers ORDER BY created_at DESC');
  return result.rows;
};

export const getDriverById = async (id: string) => {
  const result = await pool.query('SELECT * FROM drivers WHERE id = $1', [id]);
  if (result.rows.length === 0) throw new Error('Driver not found');
  return result.rows[0];
};

export const approveDriver = async (id: string) => {
  const result = await pool.query(
    'UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *',
    ['approved', id]
  );
  if (result.rows.length === 0) throw new Error('Driver not found');
  return result.rows[0];
};

export const rejectDriver = async (id: string) => {
  const result = await pool.query(
    'UPDATE drivers SET status = $1 WHERE id = $2 RETURNING *',
    ['rejected', id]
  );
  if (result.rows.length === 0) throw new Error('Driver not found');
  return result.rows[0];
};

export const toggleDriverOnline = async (id: string) => {
  const driver = await getDriverById(id);
  if (driver.status !== 'approved') throw new Error('Driver not approved yet');
  
  const result = await pool.query(
    'UPDATE drivers SET is_online = $1 WHERE id = $2 RETURNING *',
    [!driver.is_online, id]
  );
  return result.rows[0];
};