import { Request, Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getStats, getPendingDrivers, getOpenComplaints } from './admin.service';
import { getAllUsers, registerUser } from '../auth/auth.service';
import { getAllDrivers, approveDriver, rejectDriver } from '../drivers/drivers.service';
import { getTrips } from '../trips/trips.service';
import { updateComplaintStatus, getAllComplaints } from '../complaints/complaints.service';
import pool from '../database';
import dotenv from 'dotenv';
dotenv.config();

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = await getStats();
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllUsersAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = await getAllUsers();
    return res.status(200).json(allUsers);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllDriversAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const driverList = await getAllDrivers();
    return res.status(200).json(driverList);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPending = async (req: AuthRequest, res: Response) => {
  try {
    const pending = await getPendingDrivers();
    return res.status(200).json(pending);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const approveDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await approveDriver(id);
    return res.status(200).json({ message: 'Driver approved', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const rejectDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = await rejectDriver(id);
    return res.status(200).json({ message: 'Driver rejected', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllTripsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const allTrips = await getTrips();
    return res.status(200).json(allTrips);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllComplaintsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const allComplaints = await getAllComplaints();
    const open = allComplaints.filter((c: any) => c.status === 'open');
    return res.status(200).json({ open: open.length, complaints: open });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const resolveComplaintAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const complaint = await updateComplaintStatus(id, status);
    return res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const setupAdmin = async (req: Request, res: Response) => {
  try {
    const { name, fatherName, grandfatherName, email, password, secret } = req.body;
    if (secret !== process.env.ADMIN_SECRET) {
      return res.status(403).json({ message: 'Invalid setup secret' });
    }
    if (!name || !fatherName || !grandfatherName || !email || !password) {
      return res.status(400).json({ message: 'All fields are required' });
    }
    const existing = await pool.query(
      "SELECT id FROM users WHERE role = 'admin' LIMIT 1"
    );
    if (existing.rows.length > 0) {
      return res.status(400).json({ message: 'Admin already exists' });
    }
    const result = await registerUser(name, fatherName, grandfatherName, email, password, 'admin' as any);
    return res.status(201).json({ message: 'Admin account created', user: result.user, token: result.token });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
