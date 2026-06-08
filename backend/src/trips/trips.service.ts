import pool from '../database';

export type TripStatus = 
  'requested' | 'accepted' | 'driver_arrived' | 'waiting' | 
  'in_progress' | 'completed' | 'cancelled' | 
  'customer_no_show' | 'driver_no_show';

const DEPOSIT_AMOUNT = 200;
const FREE_WAITING_MINUTES = 5;
const WAITING_FEE_PER_MINUTE = 50;

export const requestTrip = async (customerId: string, pickupLocation: string, dropoffLocation: string) => {
  const result = await pool.query(
    `INSERT INTO trips (customer_id, pickup_location, dropoff_location, status, deposit, waiting_fee, waiting_minutes)
     VALUES ($1, $2, $3, 'requested', $4, 0, 0) RETURNING *`,
    [customerId, pickupLocation, dropoffLocation, DEPOSIT_AMOUNT]
  );
  return result.rows[0];
};

export const acceptTrip = async (tripId: string, driverId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].status !== 'requested') throw new Error('Trip is no longer available');

  const result = await pool.query(
    'UPDATE trips SET driver_id = $1, status = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    [driverId, 'accepted', tripId]
  );
  return result.rows[0];
};

export const driverArrived = async (tripId: string, driverId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].driver_id !== driverId) throw new Error('Not authorized');
  if (trip.rows[0].status !== 'accepted') throw new Error('Trip not accepted');

  const result = await pool.query(
    'UPDATE trips SET status = $1, arrived_at = NOW(), updated_at = NOW() WHERE id = $2 RETURNING *',
    ['driver_arrived', tripId]
  );
  return {
    trip: result.rows[0],
    message: `Driver arrived! Customer has ${FREE_WAITING_MINUTES} minutes free waiting time.`
  };
};

export const startTrip = async (tripId: string, driverId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].driver_id !== driverId) throw new Error('Not authorized');
  if (trip.rows[0].status !== 'driver_arrived') throw new Error('Driver must mark arrival first');

  let waitingFee = 0;
  let waitingMinutes = 0;

  if (trip.rows[0].arrived_at) {
    const arrivedAt = new Date(trip.rows[0].arrived_at);
    const now = new Date();
    waitingMinutes = Math.floor((now.getTime() - arrivedAt.getTime()) / 60000);
    const chargeableMinutes = Math.max(0, waitingMinutes - FREE_WAITING_MINUTES);
    waitingFee = chargeableMinutes * WAITING_FEE_PER_MINUTE;
  }

  const result = await pool.query(
    'UPDATE trips SET status = $1, waiting_fee = $2, waiting_minutes = $3, updated_at = NOW() WHERE id = $4 RETURNING *',
    ['in_progress', waitingFee, waitingMinutes, tripId]
  );
  return { trip: result.rows[0], waitingFee, waitingMinutes };
};

export const completeTrip = async (tripId: string, driverId: string, baseFare: number) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].driver_id !== driverId) throw new Error('Not authorized');
  if (trip.rows[0].status !== 'in_progress') throw new Error('Trip not in progress');

  const waitingFee = parseFloat(trip.rows[0].waiting_fee) || 0;
  const deposit = parseFloat(trip.rows[0].deposit) || 0;
  const totalFare = baseFare + waitingFee;
  const remainingAmount = Math.max(0, totalFare - deposit);

  const result = await pool.query(
    'UPDATE trips SET status = $1, fare = $2, updated_at = NOW() WHERE id = $3 RETURNING *',
    ['completed', totalFare, tripId]
  );

  return {
    trip: result.rows[0],
    summary: {
      baseFare,
      waitingFee,
      deposit,
      totalFare,
      remainingAmount,
      message: `Customer pays ${remainingAmount} DJF on arrival`
    }
  };
};

export const customerNoShow = async (tripId: string, driverId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].driver_id !== driverId) throw new Error('Not authorized');
  if (trip.rows[0].status !== 'driver_arrived') throw new Error('Driver must have arrived first');

  if (trip.rows[0].arrived_at) {
    const minutesWaited = Math.floor((new Date().getTime() - new Date(trip.rows[0].arrived_at).getTime()) / 60000);
    if (minutesWaited < FREE_WAITING_MINUTES) {
      throw new Error(`Please wait ${FREE_WAITING_MINUTES - minutesWaited} more minutes before marking no-show`);
    }
  }

  const result = await pool.query(
    'UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['customer_no_show', tripId]
  );
  return {
    trip: result.rows[0],
    message: `Customer no-show confirmed. Deposit of ${DEPOSIT_AMOUNT} DJF transferred to driver.`
  };
};

export const driverNoShow = async (tripId: string, customerId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].customer_id !== customerId) throw new Error('Not authorized');

  const minutesSinceRequest = Math.floor((new Date().getTime() - new Date(trip.rows[0].created_at).getTime()) / 60000);
  if (minutesSinceRequest < 10) {
    throw new Error(`Please wait 10 minutes before reporting no-show. ${10 - minutesSinceRequest} minutes remaining.`);
  }

  const result = await pool.query(
    'UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['driver_no_show', tripId]
  );
  return {
    trip: result.rows[0],
    message: `Driver no-show confirmed. Deposit of ${DEPOSIT_AMOUNT} DJF will be refunded.`
  };
};

export const cancelTrip = async (tripId: string, userId: string) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trip not found');
  if (trip.rows[0].customer_id !== userId && trip.rows[0].driver_id !== userId) throw new Error('Not authorized');
  
  const done = trip.rows[0].status === 'completed' || trip.rows[0].status === 'cancelled';
  if (done) throw new Error('Cannot cancel this trip');

  const result = await pool.query(
    'UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *',
    ['cancelled', tripId]
  );
  return result.rows[0];
};

export const getTrips = async () => {
  const result = await pool.query('SELECT * FROM trips ORDER BY created_at DESC');
  return result.rows;
};

export const getTripById = async (tripId: string) => {
  const result = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (result.rows.length === 0) throw new Error('Trip not found');
  return result.rows[0];
};

export const getTripsByCustomer = async (customerId: string) => {
  const result = await pool.query(
    'SELECT * FROM trips WHERE customer_id = $1 ORDER BY created_at DESC',
    [customerId]
  );
  return result.rows;
};

export const getTripsByDriver = async (driverId: string) => {
  const result = await pool.query(
    'SELECT * FROM trips WHERE driver_id = $1 ORDER BY created_at DESC',
    [driverId]
  );
  return result.rows;
};

