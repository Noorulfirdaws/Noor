import { Router } from 'express';
import {
  request,
  accept,
  arrived,
  start,
  complete,
  reportCustomerNoShow,
  reportDriverNoShow,
  cancel,
  getAllTrips,
  getTrip,
  myTrips
} from './trips.controller';
import { protect, requireAgent } from '../auth/auth.middleware';

const router = Router();

router.post('/request', protect, request);
router.get('/', protect, requireAgent, getAllTrips); // staff only — listing every trip leaks PII
router.get('/my', protect, myTrips);
router.get('/:id', protect, getTrip);
router.put('/:id/accept', protect, accept);
router.put('/:id/arrived', protect, arrived);
router.put('/:id/start', protect, start);
router.put('/:id/complete', protect, complete);
router.put('/:id/customer-no-show', protect, reportCustomerNoShow);
router.put('/:id/driver-no-show', protect, reportDriverNoShow);
router.put('/:id/cancel', protect, cancel);

export default router;