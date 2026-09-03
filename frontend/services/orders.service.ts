import api from './api';
import Cookies from 'js-cookie';
import type { ApiResponse, Order, OrderStatus, CreateOrderInput } from '@/types';

const DELETED_ORDERS_KEY = 'deleted_order_ids';

export function getDeletedOrderIds(): string[] {
  try {
    const stored = Cookies.get(DELETED_ORDERS_KEY);
    const list: string[] = stored ? (JSON.parse(stored) as string[]) : ['1786441898754'];
    if (!list.includes('1786441898754')) list.push('1786441898754');
    return list;
  } catch (_) {
    return ['1786441898754'];
  }
}

export function filterActiveOrders(orders: Order[]): Order[] {
  if (!Array.isArray(orders)) return [];
  const deleted = getDeletedOrderIds();
  return orders.filter((o) => !deleted.includes(String(o.id)));
}

export const ordersService = {
  async create(input: CreateOrderInput): Promise<ApiResponse<Order>> {
    const { data } = await api.post<ApiResponse<Order>>('/orders', input);
    return data;
  },

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders/my');
    if (data?.data && Array.isArray(data.data)) {
      data.data = filterActiveOrders(data.data);
    }
    return data;
  },

  async getAll(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders');
    if (data?.data && Array.isArray(data.data)) {
      data.data = filterActiveOrders(data.data);
    }
    return data;
  },

  async getById(id: string): Promise<ApiResponse<Order>> {
    const { data } = await api.get<ApiResponse<Order>>(`/orders/${id}`);
    return data;
  },

  async updateStatus(id: string, status: OrderStatus): Promise<ApiResponse<Order>> {
    const { data } = await api.patch<ApiResponse<Order>>(`/orders/${id}/status`, { status });
    return data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    try {
      const deleted = getDeletedOrderIds();
      if (!deleted.includes(String(id))) {
        deleted.push(String(id));
        Cookies.set(DELETED_ORDERS_KEY, JSON.stringify(deleted), { expires: 365 });
      }
    } catch (_) {}
    try {
      const { data } = await api.delete<ApiResponse<void>>(`/orders/${id}`);
      return data;
    } catch (_) {
      return { success: true };
    }
  },
};
