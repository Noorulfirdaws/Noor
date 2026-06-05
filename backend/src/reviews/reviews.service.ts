import pool from '../database';

export const createReview = async (
  tripId: string,
  customerId: string,
  driverId: string,
  rating: number,
  comment: string
) => {
  if (rating < 1 || rating > 5) throw new Error('Rating must be between 1 and 5');
  
  const existing = await pool.query(
    'SELECT id FROM reviews WHERE trip_id = $1 AND customer_id = $2',
    [tripId, customerId]
  );
  if (existing.rows.length > 0) throw new Error('You already reviewed this trip');

  const result = await pool.query(
    `INSERT INTO reviews (trip_id, customer_id, driver_id, rating, comment)
     VALUES ($1, $2, $3, $4, $5) RETURNING *`,
    [tripId, customerId, driverId, rating, comment]
  );
  return result.rows[0];
};

export const getDriverReviews = async (driverId: string) => {
  const result = await pool.query(
    'SELECT * FROM reviews WHERE driver_id = $1 ORDER BY created_at DESC',
    [driverId]
  );
  return result.rows;
};

export const getDriverAverageRating = async (driverId: string) => {
  const result = await pool.query(
    'SELECT AVG(rating) as average FROM reviews WHERE driver_id = $1',
    [driverId]
  );
  const avg = result.rows[0].average;
  return avg ? parseFloat(avg).toFixed(1) : '0';
};

export const getAllReviews = async () => {
  const result = await pool.query('SELECT * FROM reviews ORDER BY created_at DESC');
  return result.rows;
};