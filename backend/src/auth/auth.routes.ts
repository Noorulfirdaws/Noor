import { Router } from 'express';
import { register, login, updateProfile, forgotPassword, resetPasswordHandler } from './auth.controller';
import { protect } from './auth.middleware';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.put('/profile', protect, updateProfile);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordHandler);

export default router;