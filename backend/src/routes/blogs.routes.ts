import { Router } from 'express';
import {
  getBlogs,
  getBlog,
  createBlog,
  updateBlog,
  deleteBlog,
} from '../controllers/blogs.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public routes
router.get('/', getBlogs);
router.get('/:slugOrId', getBlog);

// Admin-only routes
router.post('/', authenticate, requireRole('admin'), createBlog);
router.put('/:id', authenticate, requireRole('admin'), updateBlog);
router.delete('/:id', authenticate, requireRole('admin'), deleteBlog);

export default router;
