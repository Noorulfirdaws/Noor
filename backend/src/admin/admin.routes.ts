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
  resolveComplaintAdmin,
  setupAdmin,
} from './admin.controller';
import { protect, requireRole } from '../auth/auth.middleware';

const router = Router();

// One-time setup — no auth required (protected by ADMIN_SECRET in body)
router.post('/setup', setupAdmin);

// All other admin routes require a valid admin JWT
router.get('/stats', protect, requireRole('admin'), getDashboardStats);
router.get('/users', protect, requireRole('admin'), getAllUsersAdmin);
router.get('/drivers', protect, requireRole('admin'), getAllDriversAdmin);
router.get('/drivers/pending', protect, requireRole('admin'), getPending);
router.put('/drivers/:id/approve', protect, requireRole('admin'), approveDriverAdmin);
router.put('/drivers/:id/reject', protect, requireRole('admin'), rejectDriverAdmin);
router.get('/trips', protect, requireRole('admin'), getAllTripsAdmin);
router.get('/complaints', protect, requireRole('admin'), getAllComplaintsAdmin);
router.put('/complaints/:id/status', protect, requireRole('admin'), resolveComplaintAdmin);

export default router;
