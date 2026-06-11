import { Router } from 'express';
import {
  getDashboardStats, getAllUsersAdmin, getAllDriversAdmin, getPending,
  approveDriverAdmin, rejectDriverAdmin, getAllTripsAdmin,
  getAllComplaintsAdmin, resolveComplaintAdmin, setupAdmin,
} from './admin.controller';
import { protect, requireAdmin, requireAgent } from '../auth/auth.middleware';

const router = Router();

// One-time first admin bootstrap
router.post('/setup', setupAdmin);

// Dashboard — admin + super_admin
router.get('/stats',                  protect, requireAdmin, getDashboardStats);
router.get('/users',                  protect, requireAdmin, getAllUsersAdmin);
router.get('/drivers',                protect, requireAdmin, getAllDriversAdmin);
router.get('/drivers/pending',        protect, requireAdmin, getPending);
router.put('/drivers/:id/approve',    protect, requireAdmin, approveDriverAdmin);
router.put('/drivers/:id/reject',     protect, requireAdmin, rejectDriverAdmin);
router.get('/trips',                  protect, requireAdmin, getAllTripsAdmin);

// Complaints — agents can read + resolve, admins too
router.get('/complaints',             protect, requireAgent, getAllComplaintsAdmin);
router.put('/complaints/:id/status',  protect, requireAgent, resolveComplaintAdmin);

export default router;
