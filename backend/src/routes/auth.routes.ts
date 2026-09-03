import { Router } from 'express';
import { register, login, me } from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validateAuth';
import { authenticate } from '../middleware/authenticate';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, me);

export default router;
