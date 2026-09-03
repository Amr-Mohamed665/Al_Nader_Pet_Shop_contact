/**
 * AL NADER PET SHOP BACKEND — SHARED TYPE DEFINITIONS
 */

import type { Request } from 'express';

// ─── USER TYPES ───────────────────────────────────────────────────────────────

export type UserRole = 'user' | 'admin';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
}

export interface JwtPayload {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  iat?: number;
  exp?: number;
}

// ─── PRODUCT / MENU ITEM TYPES ────────────────────────────────────────────────

export interface MenuItem {
  id: string;
  name: string;
  category: string;
  price: number;
  description: string;
  image: string;
  available: boolean;
  createdAt: string;
}

export interface MenuFilters {
  search?: string;
  category?: string;
  availableOnly?: boolean;
}

// ─── CATEGORY TYPES ───────────────────────────────────────────────────────────

export interface Category {
  id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  parentId?: string | null;
  isAccessory?: boolean;
  createdAt?: string;
}

// ─── ORDER TYPES ──────────────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface DeliveryAddress {
  street: string;
  city?: string;
  emirate: string;
  country?: string;
  postalCode?: string;
}

export interface CustomerInfo {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  userId?: string;
  customer?: CustomerInfo;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  orderNotes?: string;
  status: OrderStatus;
  total?: number;
  createdAt: string;
  updatedAt?: string;
}

// ─── WISHLIST TYPES ───────────────────────────────────────────────────────────

export interface WishlistEntry {
  userId: string;
  productId: string;
  addedAt: string;
}

// ─── EXPRESS REQUEST AUGMENTATION ────────────────────────────────────────────

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

// ─── API RESPONSE HELPERS ─────────────────────────────────────────────────────

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  count?: number;
  message?: string;
}

export interface ApiErrorResponse {
  success: false;
  message: string;
  errors?: Record<string, string>;
}

export type ApiResponse<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;
