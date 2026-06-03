import { Router } from 'express';
import { submitComplaint, getComplaints, getComplaint, myComplaints, resolveComplaint } from './complaints.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.post('/', protect, submitComplaint);
router.get('/', protect, getComplaints);
router.get('/my', protect, myComplaints);
router.get('/:id', protect, getComplaint);
router.put('/:id/status', protect, resolveComplaint);

export default router;