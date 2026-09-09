import api from './api';
import type { ApiResponse, Order, OrderStatus, CreateOrderInput } from '@/types';

export const ordersService = {
  async create(input: CreateOrderInput): Promise<ApiResponse<Order>> {
    const { data } = await api.post<ApiResponse<Order>>('/orders', input);
    return data;
  },

  async getMyOrders(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders/my');
    return data;
  },

  async getAll(): Promise<ApiResponse<Order[]>> {
    const { data } = await api.get<ApiResponse<Order[]>>('/orders');
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
      const { data } = await api.delete<ApiResponse<void>>(`/orders/${id}`);
      return data;
    } catch (err) {
      return { success: false, message: (err as Error).message || 'Failed to delete order.' };
    }
  },
};
