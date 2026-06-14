import { Router } from 'express';
import { protect, requireAdmin } from '../auth/auth.middleware';
import { paymentRateLimit } from '../middleware/rateLimit';
import {
  handleWaafiWebhook,
  handleDmoneyWebhook,
  getMyTransactions,
  getAdminTransactions,
} from './payment.controller';

const router = Router();

// Public webhook endpoints — secured by HMAC signature, not JWT
router.post('/webhook/waafi',  paymentRateLimit, handleWaafiWebhook);
router.post('/webhook/dmoney', paymentRateLimit, handleDmoneyWebhook);

// Authenticated user routes
router.get('/my', protect, getMyTransactions);

// Admin only
router.get('/', protect, requireAdmin, getAdminTransactions);

export default router;
