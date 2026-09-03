import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getAllOrders,
  getOrder,
  updateOrderStatus,
  deleteOrder,
} from '../controllers/orders.controller';
import { authenticate } from '../middleware/authenticate';
import { requireRole } from '../middleware/requireRole';
import validateOrder from '../middleware/validateOrder';

const router = Router();

router.use(authenticate); // every order route requires a logged-in user

router.post('/', validateOrder, createOrder); // place an order with UAE address validation
router.get('/my', getMyOrders); // "my orders" — must come before "/:id"
router.get('/', requireRole('admin'), getAllOrders); // every order (admin dashboard)
router.get('/:id', getOrder); // admin, or the customer who placed it
router.patch('/:id/status', requireRole('admin'), updateOrderStatus);
router.delete('/:id', requireRole('admin'), deleteOrder);

export default router;
