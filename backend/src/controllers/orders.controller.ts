import type { Request, Response, NextFunction } from 'express';
import * as ordersStore from '../data/ordersStore';
import ApiError from '../utils/ApiError';
import type { OrderStatus } from '../types/index';

/** POST /api/orders  (any logged-in user)
 *  Body: { items: [{ menuItemId, quantity }], customer, deliveryAddress, orderNotes }
 */
export function createOrder(req: Request, res: Response, next: NextFunction): void {
  try {
    const { items, customer, deliveryAddress, orderNotes } = req.body;
    const order = ordersStore.create(req.user!.id, items, { customer, deliveryAddress, orderNotes });
    res.status(201).json({ success: true, data: order });
  } catch (err) {
    next(err);
  }
}

/** GET /api/orders/my  (any logged-in user — their own order history) */
export function getMyOrders(req: Request, res: Response): void {
  const orders = ordersStore.getByUser(req.user!.id);
  res.status(200).json({ success: true, count: orders.length, data: orders });
}

/** GET /api/orders  (admin only — every order, from every customer) */
export function getAllOrders(req: Request, res: Response): void {
  const orders = ordersStore.getAll();
  res.status(200).json({ success: true, count: orders.length, data: orders });
}

/** GET /api/orders/:id  (admin, or the customer who placed it) */
export function getOrder(req: Request, res: Response, next: NextFunction): void {
  const order = ordersStore.getById(req.params['id']!);
  if (!order) {
    next(new ApiError(404, `Order with id '${req.params['id']}' was not found.`));
    return;
  }
  if (req.user!.role !== 'admin' && order.userId !== req.user!.id) {
    next(new ApiError(403, 'You can only view your own orders.'));
    return;
  }
  res.status(200).json({ success: true, data: order });
}

/** PATCH /api/orders/:id/status  (admin only)
 *  Body: { status: "pending" | "preparing" | "completed" | "cancelled" }
 */
export function updateOrderStatus(req: Request, res: Response, next: NextFunction): void {
  try {
    const { status } = req.body as { status: OrderStatus };
    const updated = ordersStore.updateStatus(req.params['id']!, status);
    if (!updated) {
      next(new ApiError(404, `Order with id '${req.params['id']}' was not found.`));
      return;
    }
    res.status(200).json({ success: true, data: updated });
  } catch (err) {
    next(err);
  }
}

/** DELETE /api/orders/:id  (admin only) */
export function deleteOrder(req: Request, res: Response, next: NextFunction): void {
  const deleted = ordersStore.remove(req.params['id']!);
  if (!deleted) {
    next(new ApiError(404, `Order with id '${req.params['id']}' was not found.`));
    return;
  }
  res.status(200).json({
    success: true,
    message: `Order #${req.params['id']} deleted successfully.`,
    data: deleted,
  });
}
