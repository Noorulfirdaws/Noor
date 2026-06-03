import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getStats, getPendingDrivers, getOpenComplaints } from './admin.service';
import { users } from '../auth/auth.service';
import { drivers, approveDriver, rejectDriver } from '../drivers/drivers.service';
import { trips } from '../trips/trips.service';
import { complaints, updateComplaintStatus } from '../complaints/complaints.service';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const stats = getStats();
    return res.status(200).json(stats);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const allUsers = users.map(u => ({ id: u.id, name: u.name, email: u.email, role: u.role }));
    return res.status(200).json(allUsers);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllDrivers = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(drivers);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getPending = async (req: AuthRequest, res: Response) => {
  try {
    const pending = getPendingDrivers();
    return res.status(200).json(pending);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const approveDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = approveDriver(id);
    return res.status(200).json({ message: 'Driver approved', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const rejectDriverAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const driver = rejectDriver(id);
    return res.status(200).json({ message: 'Driver rejected', driver });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllTrips = async (req: AuthRequest, res: Response) => {
  try {
    return res.status(200).json(trips);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getAllComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const open = getOpenComplaints();
    return res.status(200).json({ open: open.length, complaints: open });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const resolveComplaintAdmin = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    const complaint = updateComplaintStatus(id, status);
    return res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};