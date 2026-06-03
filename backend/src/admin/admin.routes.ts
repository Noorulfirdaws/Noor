import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsers,
  getAllDrivers,
  getPending,
  approveDriverAdmin,
  rejectDriverAdmin,
  getAllTrips,
  getAllComplaints,
  resolveComplaintAdmin
} from './admin.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/stats', protect, getDashboardStats);
router.get('/users', protect, getAllUsers);
router.get('/drivers', protect, getAllDrivers);
router.get('/drivers/pending', protect, getPending);
router.put('/drivers/:id/approve', protect, approveDriverAdmin);
router.put('/drivers/:id/reject', protect, rejectDriverAdmin);
router.get('/trips', protect, getAllTrips);
router.get('/complaints', protect, getAllComplaints);
router.put('/complaints/:id/status', protect, resolveComplaintAdmin);

export default router;