import { Router } from 'express';
import { addReview, getReviewsByDriver, getReviews } from './reviews.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.post('/', protect, addReview);
router.get('/', protect, getReviews);
router.get('/driver/:id', protect, getReviewsByDriver);

export default router;