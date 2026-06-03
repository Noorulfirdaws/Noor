import { Router } from 'express';
import { request, accept, start, complete, cancel, getAllTrips, getTrip, myTrips } from './trips.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.post('/request', protect, request);
router.get('/', protect, getAllTrips);
router.get('/my', protect, myTrips);
router.get('/:id', protect, getTrip);
router.put('/:id/accept', protect, accept);
router.put('/:id/start', protect, start);
router.put('/:id/complete', protect, complete);
router.put('/:id/cancel', protect, cancel);

export default router;