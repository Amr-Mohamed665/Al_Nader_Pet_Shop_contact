/**
 * AL NADER PET SHOP — SHARED TYPE DEFINITIONS
 *
 * Central type definitions for all entities and UI types.
 * Import from '@/types' throughout the project.
 */

import type { ReactNode } from 'react';

// ─── ENTITY TYPES ─────────────────────────────────────────────────────────────

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt?: string;
}

export type UserRole = 'customer' | 'admin' | 'user';

export interface Category {
  id: string;
  _id?: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  order?: number;
  parentId?: string | null;
  isAccessory?: boolean;
}

export interface Product {
  id: string;
  _id?: string;
  name: string;
  description?: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string | Category;
  categorySlug?: string;
  available?: boolean;
  featured?: boolean;
  isAccessory?: boolean;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image?: string;
}

export interface DeliveryAddress {
  street: string;
  city: string;
  emirate: string;
  country?: string;
  postalCode?: string;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
}

export interface Order {
  id: string;
  _id?: string;
  user?: string | User;
  customer?: Customer;
  items: OrderItem[];
  deliveryAddress?: DeliveryAddress;
  orderNotes?: string;
  status: OrderStatus;
  total?: number;
  createdAt?: string;
  updatedAt?: string;
}

// ─── ENUM / UNION TYPES ───────────────────────────────────────────────────────

export type OrderStatus = 'pending' | 'preparing' | 'completed' | 'cancelled';

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg';

export type BadgeVariant =
  | 'slate'
  | 'primary'
  | 'secondary'
  | 'success'
  | 'warning'
  | 'danger'
  | 'info';

export type ToastIcon = 'success' | 'error' | 'warning' | 'info' | 'question';

// ─── API RESPONSE TYPES ──────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  message?: string;
  data?: T;
  count?: number;
  errors?: Record<string, string>;
}

export interface AuthResponse {
  success: boolean;
  data: {
    user: User;
    token: string;
  };
  message?: string;
}

// ─── SERVICE INPUT TYPES ──────────────────────────────────────────────────────

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  email: string;
  password: string;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  all?: boolean;
}

export interface CreateOrderInput {
  items: OrderItem[];
  customer: Customer;
  deliveryAddress: DeliveryAddress;
  orderNotes?: string;
}

export interface CreateCategoryInput {
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parentId?: string | null;
  isAccessory?: boolean;
}

export interface UpdateCategoryInput extends Partial<CreateCategoryInput> {}

// ─── STATUS COLOR RESULT ──────────────────────────────────────────────────────

export interface StatusColor {
  bg: string;
  text: string;
  label: string;
}

// ─── NAVIGATION TYPES ─────────────────────────────────────────────────────────

export interface NavLink {
  label: string;
  href: string;
  icon?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  address: string;
}

// ─── ORDER STATUS CONSTANT TYPE ───────────────────────────────────────────────

export interface OrderStatusOption {
  value: OrderStatus;
  label: string;
  color: string;
}

// ─── CATEGORY TREE ────────────────────────────────────────────────────────────

export interface CategoryTreeNode {
  id: string;
  name: string;
  slug: string;
  image?: string;
  description?: string;
  subcategories: CategoryTreeNode[];
}

// ─── COMPONENT PROP HELPERS ──────────────────────────────────────────────────

export interface WithChildren {
  children: ReactNode;
}

export interface WithClassName {
  className?: string;
}
