import { Router } from 'express';
import { register, getDrivers, getDriver, getMe, getMyStats, updateLocation, approve, reject, toggleOnline } from './drivers.controller';
import { protect, requireAdmin } from '../auth/auth.middleware';

const router = Router();

router.post('/register', protect, register);
router.get('/', protect, getDrivers);
router.get('/me', protect, getMe);
router.get('/me/stats', protect, getMyStats);
router.put('/me/location', protect, updateLocation);
router.get('/:id', protect, getDriver);
router.put('/:id/approve', protect, requireAdmin, approve);
router.put('/:id/reject', protect, requireAdmin, reject);
router.put('/:id/toggle-online', protect, toggleOnline); // ownership enforced in controller

export default router;