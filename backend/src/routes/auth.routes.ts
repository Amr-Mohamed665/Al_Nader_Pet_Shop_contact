import { Router } from 'express';
import {
  register,
  login,
  me,
  changePassword,
  forgotPassword,
  resetPassword,
  listUsers,
  setUserRole,
  deleteUser,
  sendBulkEmail,
  adminResetPassword,
} from '../controllers/auth.controller';
import { validateRegister, validateLogin } from '../middleware/validateAuth';
import { authenticate } from '../middleware/authenticate';
import { requireAdmin } from '../middleware/requireAdmin';

const router = Router();

router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);
router.get('/me', authenticate, me);
router.patch('/change-password', authenticate, changePassword);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Admin-only user management
router.get('/users', authenticate, requireAdmin, listUsers);
router.patch('/users/:id/role', authenticate, requireAdmin, setUserRole);
router.patch('/users/:id/reset-password', authenticate, requireAdmin, adminResetPassword);
router.delete('/users/:id', authenticate, requireAdmin, deleteUser);
router.post('/users/bulk-email', authenticate, requireAdmin, sendBulkEmail);

export default router;

