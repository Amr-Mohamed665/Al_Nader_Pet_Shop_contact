import { Router } from 'express';
import {
  getCategories,
  getCategory,
  getCategoryChildren,
  createCategory,
  updateCategory,
  deleteCategory,
  reorderCategories,
} from '../controllers/categories.controller';
import validateCategory from '../middleware/validateCategory';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public routes
router.get('/', getCategories);
router.get('/:id/children', getCategoryChildren);
router.get('/:id', getCategory);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), validateCategory, createCategory);
router.put('/reorder', authenticate, requireRole('admin'), reorderCategories);
router.put('/:id', authenticate, requireRole('admin'), validateCategory, updateCategory);
router.delete('/:id', authenticate, requireRole('admin'), deleteCategory);

export default router;
