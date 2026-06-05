import { Router } from 'express';
import {
  getDashboardStats,
  getAllUsersAdmin,
  getAllDriversAdmin,
  getPending,
  approveDriverAdmin,
  rejectDriverAdmin,
  getAllTripsAdmin,
  getAllComplaintsAdmin,
  resolveComplaintAdmin
} from './admin.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/stats', protect, getDashboardStats);
router.get('/users', protect, getAllUsersAdmin);
router.get('/drivers', protect, getAllDriversAdmin);
router.get('/drivers/pending', protect, getPending);
router.put('/drivers/:id/approve', protect, approveDriverAdmin);
router.put('/drivers/:id/reject', protect, rejectDriverAdmin);
router.get('/trips', protect, getAllTripsAdmin);
router.get('/complaints', protect, getAllComplaintsAdmin);
router.put('/complaints/:id/status', protect, resolveComplaintAdmin);

export default router;