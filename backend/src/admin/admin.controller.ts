import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import { getStats, getPendingDrivers, getOpenComplaints } from './admin.service';
import { getAllUsers } from '../auth/auth.service';
import { getAllDrivers, approveDriver, rejectDriver } from '../drivers/drivers.service';
import { trips } from '../trips/trips.service';
import { updateComplaintStatus, getAllComplaints } from '../complaints/complaints.service';

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
    return res.status(200).json(trips);
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