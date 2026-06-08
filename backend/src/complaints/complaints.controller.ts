import { Response } from 'express';
import { AuthRequest } from '../auth/auth.middleware';
import {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getUserComplaints,
  updateComplaintStatus
} from './complaints.service';

export const submitComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const { tripId, against, reason, description } = req.body;
    if (!tripId || !against || !reason) {
      return res.status(400).json({ message: 'tripId, against and reason are required' });
    }
    const complaint = await createComplaint(tripId, req.user!.id, against, reason, description || '');
    return res.status(201).json({ message: 'Complaint submitted successfully', complaint });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const allComplaints = await getAllComplaints();
    return res.status(200).json(allComplaints);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const getComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const complaint = await getComplaintById(id);
    return res.status(200).json(complaint);
  } catch (error: any) {
    return res.status(404).json({ message: error.message });
  }
};

export const myComplaints = async (req: AuthRequest, res: Response) => {
  try {
    const userComplaints = await getUserComplaints(req.user!.id);
    return res.status(200).json(userComplaints);
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};

export const resolveComplaint = async (req: AuthRequest, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status } = req.body;
    if (!['open', 'investigating', 'resolved', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }
    const complaint = await updateComplaintStatus(id, status);
    return res.status(200).json({ message: 'Complaint updated', complaint });
  } catch (error: any) {
    return res.status(400).json({ message: error.message });
  }
};
