import fs from 'fs';
import path from 'path';
import { getById as getMenuItemById } from './menuItemsStore';
import ApiError from '../utils/ApiError';
import { normalizePhone } from '../constants/uaeConstants';
import { sendOrderNotificationEmail, sendCustomerOrderConfirmationEmail } from '../utils/mailer';
import type { OrderStatus } from '../types/index';

const DATA_FILE = path.join(__dirname, 'orders.json');
export const VALID_STATUSES: OrderStatus[] = ['pending', 'preparing', 'completed', 'cancelled'];

// ─── FULL ORDER SHAPE (internal representation) ───────────────────────────────

interface OrderCustomer {
  fullName: string;
  phone: string;
  email: string;
}

interface OrderDeliveryAddress {
  emirate: string;
  area: string;
  street: string;
  building: string;
  floor: string;
  apartment: string;
  landmark: string;
  instructions: string;
}

interface OrderLineItem {
  menuItemId: string;
  name: string;
  price: number;
  quantity: number;
  lineTotal: number;
}

export interface FullOrder {
  id: string;
  userId: string;
  customer?: OrderCustomer;
  deliveryAddress?: OrderDeliveryAddress;
  orderNotes: string;
  items: OrderLineItem[];
  subtotal: number;
  deliveryFee: number;
  total: number;
  status: OrderStatus;
  paymentMethod: string;
  paymentStatus: string;
  createdAt: string;
}

interface RequestedItem {
  menuItemId: string;
  quantity: number | string;
}

interface CreateOrderOptions {
  customer?: {
    fullName?: string;
    phone?: string;
    email?: string;
  };
  deliveryAddress?: {
    emirate?: string;
    area?: string;
    street?: string;
    building?: string;
    floor?: string;
    apartment?: string;
    landmark?: string;
    instructions?: string;
  };
  orderNotes?: string;
  paymentMethod?: string;
}

interface UpdatePaymentInfoData {
  paymentStatus?: string;
}

// ─── FILE I/O ─────────────────────────────────────────────────────────────────

function readAll(): FullOrder[] {
  const raw = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(raw) as FullOrder[];
}

function writeAll(orders: FullOrder[]): void {
  fs.writeFileSync(DATA_FILE, JSON.stringify(orders, null, 2), 'utf-8');
}

// ─── QUERIES ──────────────────────────────────────────────────────────────────

export function getAll(): FullOrder[] {
  return readAll();
}

export function getByUser(userId: string): FullOrder[] {
  return readAll().filter((o) => o.userId === String(userId));
}

export function getById(id: string): FullOrder | undefined {
  return readAll().find((o) => o.id === String(id));
}

// ─── MUTATIONS ────────────────────────────────────────────────────────────────

/**
 * requestedItems: [{ menuItemId, quantity }]
 * Prices are NEVER trusted from the client — every price is looked up
 * on the server from the current menu, at order time.
 */
export function create(
  userId: string,
  requestedItems: RequestedItem[],
  { customer, deliveryAddress, orderNotes, paymentMethod }: CreateOrderOptions = {}
): FullOrder {
  if (!Array.isArray(requestedItems) || requestedItems.length === 0) {
    throw new ApiError(400, "'items' must be a non-empty array of { menuItemId, quantity }.");
  }

  const orderItems: OrderLineItem[] = requestedItems.map(({ menuItemId, quantity }) => {
    const qty = Number(quantity);
    if (!menuItemId || !Number.isInteger(qty) || qty < 1) {
      throw new ApiError(400, "Each item needs a valid 'menuItemId' and a positive integer 'quantity'.");
    }

    const menuItem = getMenuItemById(menuItemId);
    if (!menuItem) {
      throw new ApiError(404, `Menu item '${menuItemId}' was not found.`);
    }
    if (menuItem.available === false) {
      throw new ApiError(400, `'${menuItem.name}' is currently unavailable.`);
    }

    return {
      menuItemId: menuItem.id,
      name: menuItem.name,
      price: menuItem.price, // snapshot — future price changes won't affect old orders
      quantity: qty,
      lineTotal: menuItem.price * qty,
    };
  });

  const subtotal = orderItems.reduce((sum, item) => sum + item.lineTotal, 0);
  const deliveryFee = 0; // Currently free shipping
  const total = subtotal + deliveryFee;

  // Normalize phone number to +971 format
  const normalizedPhone = customer?.phone ? normalizePhone(customer.phone) : undefined;

  const orders = readAll();
  const newOrder: FullOrder = {
    id: Date.now().toString(),
    userId: String(userId),
    customer: customer
      ? {
          fullName: customer.fullName?.trim() ?? '',
          phone: normalizedPhone ?? customer.phone ?? '',
          email: customer.email?.trim().toLowerCase() ?? '',
        }
      : undefined,
    deliveryAddress: deliveryAddress
      ? {
          emirate: deliveryAddress.emirate ?? '',
          area: deliveryAddress.area?.trim() ?? '',
          street: deliveryAddress.street?.trim() ?? '',
          building: deliveryAddress.building?.trim() ?? '',
          floor: deliveryAddress.floor?.trim() ?? '',
          apartment: deliveryAddress.apartment?.trim() ?? '',
          landmark: deliveryAddress.landmark?.trim() ?? '',
          instructions: deliveryAddress.instructions?.trim() ?? '',
        }
      : undefined,
    orderNotes: orderNotes?.trim() ?? '',
    items: orderItems,
    subtotal,
    deliveryFee,
    total,
    status: 'pending',
    paymentMethod: paymentMethod ?? 'cod',
    paymentStatus: 'unpaid',
    createdAt: new Date().toISOString(),
  };

  orders.push(newOrder);
  writeAll(orders);

  // Send email notifications asynchronously (Admin notification + Customer confirmation)
  if (newOrder.customer && newOrder.deliveryAddress) {
    const fullOrder = {
      ...newOrder,
      customer: newOrder.customer,
      deliveryAddress: newOrder.deliveryAddress,
    };

    sendOrderNotificationEmail(fullOrder).catch((err: Error) => {
      console.error('❌ Failed to send admin order email notification:', err.message);
    });

    sendCustomerOrderConfirmationEmail(fullOrder).catch((err: Error) => {
      console.error('❌ Failed to send customer order confirmation email:', err.message);
    });
  }

  return newOrder;
}

export function updateStatus(id: string, status: OrderStatus): FullOrder | null {
  if (!VALID_STATUSES.includes(status)) {
    throw new ApiError(400, `'status' must be one of: ${VALID_STATUSES.join(', ')}.`);
  }

  const orders = readAll();
  const index = orders.findIndex((o) => o.id === String(id));
  if (index === -1) return null;

  orders[index].status = status;
  writeAll(orders);
  return orders[index];
}

export function updatePaymentInfo(id: string, data: UpdatePaymentInfoData): FullOrder | null {
  const orders = readAll();
  const index = orders.findIndex((o) => o.id === String(id));
  if (index === -1) return null;

  if (data.paymentStatus !== undefined) orders[index].paymentStatus = data.paymentStatus;

  writeAll(orders);
  return orders[index];
}

export function remove(id: string): FullOrder | null {
  const orders = readAll();
  const index = orders.findIndex((o) => o.id === String(id));
  if (index === -1) return null;

  const removed = orders[index];
  orders.splice(index, 1);
  writeAll(orders);
  return removed;
}
