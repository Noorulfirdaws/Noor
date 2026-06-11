import crypto from 'crypto';
import pool from '../database';

export type PaymentProvider = 'waafi' | 'dmoney' | 'cac_bank';
export type PaymentStatus = 'pending' | 'confirmed' | 'failed' | 'refunded';
export type PaymentPurpose = 'deposit' | 'fare_completion' | 'refund';

// ── Anti-replay: check + record transaction ID in DB ──────────────────────────
export const isTransactionProcessed = async (transactionId: string): Promise<boolean> => {
  const result = await pool.query(
    'SELECT id FROM transactions WHERE provider_transaction_id = $1',
    [transactionId]
  );
  return result.rows.length > 0;
};

export const recordTransaction = async (data: {
  tripId?: string;
  userId: string;
  provider: PaymentProvider;
  providerTransactionId: string;
  amount: number;
  currency: string;
  purpose: PaymentPurpose;
  status: PaymentStatus;
  rawPayload: object;
}) => {
  const result = await pool.query(
    `INSERT INTO transactions
       (trip_id, user_id, provider, provider_transaction_id, amount, currency, purpose, status, raw_payload)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
     RETURNING *`,
    [
      data.tripId || null,
      data.userId,
      data.provider,
      data.providerTransactionId,
      data.amount,
      data.currency,
      data.purpose,
      data.status,
      JSON.stringify(data.rawPayload),
    ]
  );
  return result.rows[0];
};

// ── WAAFI signature verification ──────────────────────────────────────────────
export const verifyWaafiSignature = (payload: object, receivedSignature: string): boolean => {
  const secret = process.env.WAAFI_WEBHOOK_SECRET;
  if (!secret) throw new Error('WAAFI_WEBHOOK_SECRET non configuré.');

  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(computed, 'hex')
    );
  } catch {
    return false;
  }
};

// ── D-Money signature verification ────────────────────────────────────────────
export const verifyDmoneySignature = (payload: object, receivedSignature: string): boolean => {
  const secret = process.env.DMONEY_WEBHOOK_SECRET;
  if (!secret) throw new Error('DMONEY_WEBHOOK_SECRET non configuré.');

  const computed = crypto
    .createHmac('sha256', secret)
    .update(JSON.stringify(payload))
    .digest('hex');

  try {
    return crypto.timingSafeEqual(
      Buffer.from(receivedSignature, 'hex'),
      Buffer.from(computed, 'hex')
    );
  } catch {
    return false;
  }
};

// ── Apply confirmed payment to trip ───────────────────────────────────────────
export const applyPaymentToTrip = async (
  tripId: string,
  purpose: PaymentPurpose,
  amount: number
) => {
  const trip = await pool.query('SELECT * FROM trips WHERE id = $1', [tripId]);
  if (trip.rows.length === 0) throw new Error('Trajet introuvable.');

  if (purpose === 'deposit') {
    await pool.query(
      'UPDATE trips SET deposit = $1, updated_at = NOW() WHERE id = $2',
      [amount, tripId]
    );
  }

  if (purpose === 'fare_completion') {
    await pool.query(
      'UPDATE trips SET fare = $1, status = $2, updated_at = NOW() WHERE id = $3',
      [amount, 'completed', tripId]
    );
  }

  if (purpose === 'refund') {
    await pool.query(
      'UPDATE trips SET status = $1, updated_at = NOW() WHERE id = $2',
      ['refunded', tripId]
    );
  }
};

// ── Get transaction history for a user ────────────────────────────────────────
export const getUserTransactions = async (userId: string) => {
  const result = await pool.query(
    `SELECT id, provider, amount, currency, purpose, status, created_at
     FROM transactions WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );
  return result.rows;
};

// ── Admin: all transactions ────────────────────────────────────────────────────
export const getAllTransactions = async () => {
  const result = await pool.query(
    `SELECT t.*, u.name AS user_name, u.email AS user_email
     FROM transactions t
     LEFT JOIN users u ON t.user_id = u.id
     ORDER BY t.created_at DESC`
  );
  return result.rows;
};
