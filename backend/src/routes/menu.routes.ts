import { Router } from 'express';
import {
  getMenu,
  getMenuItem,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
  reorderMenuItems,
  getRecommendedAccessories,
} from '../controllers/menu.controller';
import validateMenuItem from '../middleware/validateMenuItem';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public — the landing page shows the menu without anyone logging in
router.get('/', getMenu);
router.get('/:id/recommended-accessories', getRecommendedAccessories);
router.get('/:id', getMenuItem);

// Admin only — creating/editing/removing dishes
router.post('/', authenticate, requireRole('admin'), validateMenuItem, createMenuItem);
router.put('/reorder', authenticate, requireRole('admin'), reorderMenuItems);
router.put('/:id', authenticate, requireRole('admin'), validateMenuItem, updateMenuItem);
router.delete('/:id', authenticate, requireRole('admin'), deleteMenuItem);

export default router;
