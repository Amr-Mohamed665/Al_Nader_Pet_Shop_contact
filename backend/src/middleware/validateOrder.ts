import type { Request, Response, NextFunction } from 'express';
import ApiError from '../utils/ApiError';
import { UAE_EMIRATES, UAE_PHONE_RE } from '../constants/uaeConstants';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_SHORT = 100;
const MAX_MEDIUM = 200;
const MAX_LONG = 500;
const MAX_FLOOR = 20;
const MAX_APARTMENT = 50;

export function validateOrder(req: Request, res: Response, next: NextFunction): void {
  const errors: Record<string, string> = {};
  const { customer, deliveryAddress, orderNotes, items } = (req.body ?? {}) as {
    customer?: Record<string, unknown>;
    deliveryAddress?: Record<string, unknown>;
    orderNotes?: unknown;
    items?: unknown[];
  };

  // ── Customer ──────────────────────────────────────────────────────────────

  if (!customer || typeof customer !== 'object') {
    errors['customer'] = 'Customer information is required.';
  } else {
    if (!customer['fullName'] || typeof customer['fullName'] !== 'string' || !String(customer['fullName']).trim()) {
      errors['customer.fullName'] = 'Full name is required.';
    } else if (String(customer['fullName']).trim().length > MAX_SHORT) {
      errors['customer.fullName'] = `Full name must be ${MAX_SHORT} characters or fewer.`;
    }

    if (!customer['phone'] || typeof customer['phone'] !== 'string' || !String(customer['phone']).trim()) {
      errors['customer.phone'] = 'Phone number is required.';
    } else {
      const cleaned = String(customer['phone']).replace(/[\s\-()]/g, '');
      if (!UAE_PHONE_RE.test(cleaned)) {
        errors['customer.phone'] = 'Please enter a valid UAE phone number (e.g. 05x xxx xxxx).';
      }
    }

    if (!customer['email'] || typeof customer['email'] !== 'string' || !String(customer['email']).trim()) {
      errors['customer.email'] = 'Email address is required.';
    } else if (!EMAIL_RE.test(String(customer['email']).trim())) {
      errors['customer.email'] = 'Please enter a valid email address.';
    }
  }

  // ── Delivery Address ──────────────────────────────────────────────────────

  if (!deliveryAddress || typeof deliveryAddress !== 'object') {
    errors['deliveryAddress'] = 'Delivery address is required.';
  } else {
    if (!deliveryAddress['emirate'] || !(UAE_EMIRATES as readonly string[]).includes(String(deliveryAddress['emirate']))) {
      errors['deliveryAddress.emirate'] = 'Please select a valid UAE emirate.';
    }

    if (!deliveryAddress['area'] || typeof deliveryAddress['area'] !== 'string' || !String(deliveryAddress['area']).trim()) {
      errors['deliveryAddress.area'] = 'Area / Community is required.';
    } else if (String(deliveryAddress['area']).trim().length > MAX_SHORT) {
      errors['deliveryAddress.area'] = `Area must be ${MAX_SHORT} characters or fewer.`;
    }

    if (!deliveryAddress['street'] || typeof deliveryAddress['street'] !== 'string' || !String(deliveryAddress['street']).trim()) {
      errors['deliveryAddress.street'] = 'Street is required.';
    } else if (String(deliveryAddress['street']).trim().length > MAX_MEDIUM) {
      errors['deliveryAddress.street'] = `Street must be ${MAX_MEDIUM} characters or fewer.`;
    }

    if (!deliveryAddress['building'] || typeof deliveryAddress['building'] !== 'string' || !String(deliveryAddress['building']).trim()) {
      errors['deliveryAddress.building'] = 'Building / Villa name or number is required.';
    } else if (String(deliveryAddress['building']).trim().length > MAX_SHORT) {
      errors['deliveryAddress.building'] = `Building must be ${MAX_SHORT} characters or fewer.`;
    }

    // Optional fields — validate length only if supplied
    if (deliveryAddress['floor'] !== undefined && deliveryAddress['floor'] !== null && deliveryAddress['floor'] !== '') {
      if (typeof deliveryAddress['floor'] !== 'string' || String(deliveryAddress['floor']).trim().length > MAX_FLOOR) {
        errors['deliveryAddress.floor'] = `Floor must be ${MAX_FLOOR} characters or fewer.`;
      }
    }

    if (deliveryAddress['apartment'] !== undefined && deliveryAddress['apartment'] !== null && deliveryAddress['apartment'] !== '') {
      if (typeof deliveryAddress['apartment'] !== 'string' || String(deliveryAddress['apartment']).trim().length > MAX_APARTMENT) {
        errors['deliveryAddress.apartment'] = `Apartment / Unit must be ${MAX_APARTMENT} characters or fewer.`;
      }
    }

    if (deliveryAddress['landmark'] !== undefined && deliveryAddress['landmark'] !== null && deliveryAddress['landmark'] !== '') {
      if (typeof deliveryAddress['landmark'] !== 'string' || String(deliveryAddress['landmark']).trim().length > MAX_MEDIUM) {
        errors['deliveryAddress.landmark'] = `Landmark must be ${MAX_MEDIUM} characters or fewer.`;
      }
    }

    if (deliveryAddress['instructions'] !== undefined && deliveryAddress['instructions'] !== null && deliveryAddress['instructions'] !== '') {
      if (typeof deliveryAddress['instructions'] !== 'string' || String(deliveryAddress['instructions']).trim().length > MAX_LONG) {
        errors['deliveryAddress.instructions'] = `Delivery instructions must be ${MAX_LONG} characters or fewer.`;
      }
    }
  }

  // ── Order Notes ───────────────────────────────────────────────────────────

  if (orderNotes !== undefined && orderNotes !== null && orderNotes !== '') {
    if (typeof orderNotes !== 'string' || orderNotes.trim().length > MAX_LONG) {
      errors['orderNotes'] = `Order notes must be ${MAX_LONG} characters or fewer.`;
    }
  }

  // ── Items (basic check — detailed item validation stays in ordersStore.create) ──

  if (!Array.isArray(items) || items.length === 0) {
    errors['items'] = 'At least one order item is required.';
  }

  if (Object.keys(errors).length > 0) {
    next(new ApiError(400, 'Validation failed', errors));
    return;
  }

  next();
}

export default validateOrder;
