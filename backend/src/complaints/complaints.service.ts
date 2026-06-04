import { v4 as uuidv4 } from 'uuid';

export type ComplaintStatus = 'open' | 'investigating' | 'resolved' | 'dismissed';

export interface Complaint {
  id: string;
  tripId: string;
  userId: string;
  against: string;
  reason: string;
  description: string;
  status: ComplaintStatus;
  createdAt: Date;
  updatedAt: Date;
}

export const complaints: Complaint[] = [];

export const createComplaint = (
  tripId: string,
  userId: string,
  against: string,
  reason: string,
  description: string
) => {
  const complaint: Complaint = {
    id: uuidv4(),
    tripId,
    userId,
    against,
    reason,
    description,
    status: 'open',
    createdAt: new Date(),
    updatedAt: new Date()
  };
  complaints.push(complaint);
  return complaint;
};

export const getAllComplaints = () => complaints;

export const getComplaintById = (id: string) => {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('Complaint not found');
  return complaint;
};

export const getUserComplaints = (userId: string) => {
  return complaints.filter(c => c.userId === userId);
};

export const updateComplaintStatus = (id: string, status: ComplaintStatus) => {
  const complaint = complaints.find(c => c.id === id);
  if (!complaint) throw new Error('Complaint not found');
  complaint.status = status;
  complaint.updatedAt = new Date();
  return complaint;
};