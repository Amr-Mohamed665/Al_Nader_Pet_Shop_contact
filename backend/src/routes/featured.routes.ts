import { Router } from 'express';
import { getFeatured, setFeatured } from '../controllers/featured.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';

const router = Router();

// Public — home page reads the featured IDs
router.get('/', getFeatured);

// Admin only — save the selected featured product IDs
router.put('/', authenticate, requireRole('admin'), setFeatured);

export default router;
