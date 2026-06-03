import { Router } from 'express';
import { getUsers, getUser, updateUserProfile, removeUser } from './users.controller';
import { protect } from '../auth/auth.middleware';

const router = Router();

router.get('/', protect, getUsers);
router.get('/:id', protect, getUser);
router.put('/:id', protect, updateUserProfile);
router.delete('/:id', protect, removeUser);

export default router;