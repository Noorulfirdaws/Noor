import { Request, Response } from 'express';
import { AuthRequest, auditLog } from '../auth/auth.middleware';
import { getStats, getPendingDrivers } from './admin.service';
import { getAllUsers, registerUser } from '../auth/auth.service';
import { getAllDrivers, approveDriver, rejectDriver } from '../drivers/drivers.service';
import { getTrips } from '../trips/trips.service';
import { updateComplaintStatus, getAllComplaints } from '../complaints/complaints.service';
import pool from '../database';
import dotenv from 'dotenv';
dotenv.config();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(await getStats());
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(await getAllUsers());
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getAllDriversAdmin = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(await getAllDrivers());
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getPending = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(await getPendingDrivers());
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const approveDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const driver = await approveDriver(String(req.params.id));
    await auditLog(req.user!.id, req.user!.role, 'APPROVE_DRIVER',
      'driver', String(req.params.id), {}, String(req.ip || ''));
    return res.status(200).json({ message: 'Driver approved', driver });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const rejectDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const driver = await rejectDriver(String(req.params.id));
    await auditLog(req.user!.id, req.user!.role, 'REJECT_DRIVER',
      'driver', String(req.params.id), {}, String(req.ip || ''));
    return res.status(200).json({ message: 'Driver rejected', driver });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getAllTripsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(await getTrips());
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const getAllComplaintsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const all = await getAllComplaints();
    return res.status(200).json({ total: all.length, complaints: all });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const resolveComplaintAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.body;
    const complaint = await updateComplaintStatus(String(req.params.id), status);
    await auditLog(req.user!.id, req.user!.role, 'UPDATE_COMPLAINT',
      'complaint', String(req.params.id), { status }, String(req.ip || ''));
    return res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};

export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { name, fatherName, grandfatherName, email, password, secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET)
      return res.status(403).json({ message: 'Invalid setup secret' });
    if (!name || !email || !password)
      return res.status(400).json({ message: 'name, email and password required' });

    const existing = await pool.query("SELECT id FROM users WHERE role='admin' LIMIT 1");
    if (existing.rows.length > 0)
      return res.status(400).json({ message: 'Admin already exists. Use /api/super-admin/staff to create more.' });

    const result = await registerUser(name, fatherName || '', grandfatherName || '', email, password, 'admin' as any);
    return res.status(201).json({ message: 'Admin created', user: result.user, token: result.token });
  } catch (err: any) {
    return res.status(400).json({ message: err.message });
  }
};
