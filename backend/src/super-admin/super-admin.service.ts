import bcrypt from 'bcryptjs';
import pool from '../database';

// ── Staff management ──────────────────────────────────────────────────────────

export const createStaffAccount = async (data: {
  name: string;
  email: string;
  password: string;
  role: 'admin' | 'agent';
}) => {
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [data.email]);
  if (existing.rows.length > 0) throw new Error('Email déjà enregistré.');

  const hashed = await bcrypt.hash(data.password, 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1,$2,$3,$4)
     RETURNING id, name, email, role, created_at`,
    [data.name, data.email, hashed, data.role]
  );
  return result.rows[0];
};

export const getAllStaff = async () => {
  const result = await pool.query(
    `SELECT id, name, email, role, created_at
     FROM users
     WHERE role IN ('admin','agent','super_admin')
     ORDER BY role DESC, created_at ASC`
  );
  return result.rows;
};

export const deactivateStaff = async (userId: string, requestorRole: string) => {
  const target = await pool.query('SELECT role FROM users WHERE id = $1', [userId]);
  if (target.rows.length === 0) throw new Error('Utilisateur introuvable.');
  if (target.rows[0].role === 'super_admin') throw new Error('Un super admin ne peut pas être désactivé.');
  if (target.rows[0].role === 'admin' && requestorRole !== 'super_admin')
    throw new Error('Seul un super admin peut désactiver un admin.');

  // We "deactivate" by resetting the role to a locked sentinel — or delete
  await pool.query('DELETE FROM users WHERE id = $1 AND role != $2', [userId, 'super_admin']);
};

export const changeStaffRole = async (userId: string, newRole: 'admin' | 'agent') => {
  const result = await pool.query(
    `UPDATE users SET role = $1 WHERE id = $2 AND role NOT IN ('super_admin','customer','driver')
     RETURNING id, name, email, role`,
    [newRole, userId]
  );
  if (result.rows.length === 0) throw new Error('Opération non autorisée.');
  return result.rows[0];
};

// ── App settings ──────────────────────────────────────────────────────────────

export const getAppSettings = async () => {
  const result = await pool.query('SELECT key, value, updated_at FROM app_settings ORDER BY key');
  return result.rows;
};

export const updateAppSetting = async (key: string, value: string, updatedBy: string) => {
  const result = await pool.query(
    `INSERT INTO app_settings (key, value, updated_by, updated_at)
     VALUES ($1,$2,$3,NOW())
     ON CONFLICT (key) DO UPDATE SET value=$2, updated_by=$3, updated_at=NOW()
     RETURNING *`,
    [key, value, updatedBy]
  );
  return result.rows[0];
};

// ── Audit log ─────────────────────────────────────────────────────────────────

export const getAuditLog = async (limit = 100, offset = 0) => {
  const result = await pool.query(
    `SELECT a.*, u.name AS actor_name, u.email AS actor_email
     FROM audit_logs a
     LEFT JOIN users u ON a.actor_id = u.id
     ORDER BY a.created_at DESC
     LIMIT $1 OFFSET $2`,
    [limit, offset]
  );
  return result.rows;
};

// ── Financial overview ────────────────────────────────────────────────────────

export const getFinancialReport = async () => {
  const [trips, transactions] = await Promise.all([
    pool.query(`
      SELECT
        COUNT(*) FILTER (WHERE status='completed')            AS completed_trips,
        SUM(fare) FILTER (WHERE status='completed')           AS gross_revenue,
        SUM(fare * 0.15) FILTER (WHERE status='completed')    AS platform_commission,
        SUM(deposit) FILTER (WHERE status='completed')        AS total_deposits,
        COUNT(*) FILTER (WHERE status='cancelled')            AS cancelled_trips,
        COUNT(*) FILTER (WHERE status='driver_no_show')       AS driver_noshows,
        COUNT(*) FILTER (WHERE status='customer_no_show')     AS customer_noshows
      FROM trips
    `),
    pool.query(`
      SELECT
        provider,
        COUNT(*)            AS tx_count,
        SUM(amount)         AS total_amount,
        status
      FROM transactions
      GROUP BY provider, status
      ORDER BY provider, status
    `),
  ]);

  return {
    trips: trips.rows[0],
    transactions: transactions.rows,
  };
};

// ── Super admin setup (one-time) ──────────────────────────────────────────────

export const setupSuperAdmin = async (data: {
  name: string;
  email: string;
  password: string;
  secret: string;
}) => {
  if (data.secret !== process.env.SUPER_ADMIN_SECRET)
    throw new Error('Secret invalide.');

  const existing = await pool.query(
    'SELECT id FROM users WHERE role = $1', ['super_admin']
  );
  if (existing.rows.length > 0)
    throw new Error('Un super admin existe déjà.');

  const hashed = await bcrypt.hash(data.password, 12);
  const result = await pool.query(
    `INSERT INTO users (name, email, password, role)
     VALUES ($1,$2,$3,'super_admin')
     RETURNING id, name, email, role`,
    [data.name, data.email, hashed]
  );
  return result.rows[0];
};
