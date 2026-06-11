import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import pool from '../database';

const JWT_SECRET = process.env.JWT_SECRET || 'djib-taxi-super-secret-key-2024';

export interface AuthRequest extends Request {
  user?: { id: string; email: string; role: string; };
}

// Role hierarchy — higher index = more privilege
const ROLE_LEVEL: Record<string, number> = {
  customer:    0,
  driver:      1,
  agent:       2,
  admin:       3,
  super_admin: 4,
};

export const protect = (req: AuthRequest, res: Response, next: NextFunction) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer '))
    return res.status(401).json({ message: 'No token provided' });

  const token = authHeader.substring(7);
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as any;
    req.user = { id: decoded.id, email: decoded.email, role: decoded.role };
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};

// Allow a specific set of roles
export const requireRole = (...roles: string[]) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role))
      return res.status(403).json({ message: 'Forbidden' });
    next();
  };

// Allow anyone with at least this role level (super_admin always passes)
export const requireMinRole = (minRole: string) =>
  (req: AuthRequest, res: Response, next: NextFunction) => {
    const level = ROLE_LEVEL[req.user?.role || ''] ?? -1;
    const required = ROLE_LEVEL[minRole] ?? 99;
    if (!req.user || level < required)
      return res.status(403).json({ message: 'Insufficient permissions' });
    next();
  };

export const requireSuperAdmin = requireMinRole('super_admin');
export const requireAdmin       = requireMinRole('admin');   // admin + super_admin
export const requireAgent       = requireMinRole('agent');   // agent + admin + super_admin

// Audit log helper — call after a privileged action
export const auditLog = async (
  actorId: string,
  actorRole: string,
  action: string,
  targetType: string,
  targetId: string,
  details: object = {},
  ip = ''
) => {
  try {
    await pool.query(
      `INSERT INTO audit_logs (actor_id, actor_role, action, target_type, target_id, details, ip_address)
       VALUES ($1,$2,$3,$4,$5,$6,$7)`,
      [actorId, actorRole, action, targetType, targetId, JSON.stringify(details), ip]
    );
  } catch (err: any) {
    console.error('[AuditLog] Failed to write:', err.message);
  }
};
