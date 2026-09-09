import api from './api';
import type { ApiResponse, Item, ItemFilters } from '@/types';

export const itemsService = {
  async getAll(filters: ItemFilters = {}): Promise<ApiResponse<Item[]>> {
    const params: Record<string, string | boolean> = {};
    if (filters.search) params.search = filters.search;
    if (filters.category) params.category = filters.category;
    if (filters.all) {
      params.all = filters.all;
      params._t = Date.now().toString();
    }
    try {
      const res = await api.get<ApiResponse<Item[]>>('/menu', {
        params,
        headers: filters.all
          ? {
              'Cache-Control': 'no-cache, no-store, must-revalidate',
              Pragma: 'no-cache',
              Expires: '0',
            }
          : undefined,
      });
      return res.data;
    } catch (err) {
      return { success: false, data: [], message: (err as Error).message };
    }
  },

  async getById(id: string): Promise<ApiResponse<Item>> {
    const { data } = await api.get<ApiResponse<Item>>(`/menu/${id}`);
    return data;
  },

  async create(itemData: FormData | Partial<Item>): Promise<ApiResponse<Item>> {
    const { data } = await api.post<ApiResponse<Item>>('/menu', itemData);
    return data;
  },

  async update(id: string, itemData: FormData | Partial<Item>): Promise<ApiResponse<Item>> {
    const { data } = await api.put<ApiResponse<Item>>(`/menu/${id}`, itemData);
    return data;
  },

  async toggleAvailability(id: string, available: boolean): Promise<ApiResponse<Item>> {
    const { data } = await api.put<ApiResponse<Item>>(`/menu/${id}`, { available });
    return data;
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    const { data } = await api.delete<ApiResponse<void>>(`/menu/${id}`);
    return data;
  },

  async getFeaturedIds(): Promise<ApiResponse<string[]>> {
    const { data } = await api.get<ApiResponse<string[]>>('/featured');
    return data;
  },

  async setFeaturedIds(ids: string[]): Promise<ApiResponse<string[]>> {
    const { data } = await api.put<ApiResponse<string[]>>('/featured', { ids });
    return data;
  },

  async reorder(ids: string[]): Promise<ApiResponse<Item[]>> {
    const { data } = await api.put<ApiResponse<Item[]>>('/menu/reorder', { ids });
    return data;
  },

  async getRecommendedAccessories(id: string): Promise<ApiResponse<Item[]>> {
    const { data } = await api.get<ApiResponse<Item[]>>(`/menu/${id}/recommended-accessories`);
    return data;
  },
};

export const productsService = itemsService;
