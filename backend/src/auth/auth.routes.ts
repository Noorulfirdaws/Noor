import { Router } from 'express';
import { register, login } from './auth.controller';

const router = Router();router.get('/ping', (req, res) => res.json({ message: 'trips ping works' }));

router.post('/register', register);
router.post('/login', login);

export default router;