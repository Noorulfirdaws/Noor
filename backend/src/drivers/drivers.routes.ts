import { Router } from 'express';
import { register, getDrivers, getDriver, getMe, getMyStats, approve, reject, toggleOnline } from './drivers.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.post('/register', protect, register);
router.get('/', protect, getDrivers);
router.get('/me', protect, getMe);
router.get('/me/stats', protect, getMyStats);
router.get('/:id', protect, getDriver);
router.put('/:id/approve', protect, approve);
router.put('/:id/reject', protect, reject);
router.put('/:id/toggle-online', protect, toggleOnline);

export default router;