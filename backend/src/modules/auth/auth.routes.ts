import { Router } from 'express';
import { register, login, getCurrentMember } from './auth.controller';
import { registerValidator, loginValidator } from './auth.validators';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.post('/register', registerValidator, register);
router.post('/login', loginValidator, login);
router.get('/me', authenticate, getCurrentMember);

export default router;
